#!/usr/bin/env bash
# verify.sh - One-command verification suite for AI agents and humans.
# Usage: bash scripts/verify.sh [--quick]
#
# Full suite (--quick omitted):
#   [1/6] bun install
#   [2/6] prisma generate
#   [3/6] db:push            (creates ./prisma/dev.db if .env doesn't override)
#   [4/6] ESLint             (0 errors required)
#   [5/6] TypeScript         (0 errors required — no sacred-error carve-out)
#   [6/6] Dev server 200     (GET / must return 200 within 60s)
#
# Quick suite (--quick): lint + tsc only. For fast inner-loop verification.
set -euo pipefail

QUICK=false
[[ "${1:-}" == "--quick" ]] && QUICK=true

# Resolve the project root from the script's own location so the script
# works regardless of the caller's cwd. Only set DATABASE_URL if .env
# doesn't already provide one.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
if [ -z "${DATABASE_URL:-}" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
  export DATABASE_URL="file:$PROJECT_ROOT/prisma/dev.db"
fi

echo ""
echo "=========================================="
echo "  Smile Live Kit Verification Suite"
echo "  DATABASE_URL=${DATABASE_URL:-(from .env)}"
echo "  Mode: $([ "$QUICK" = true ] && echo "quick (lint + tsc)" || echo "full (lint + tsc + dev 200)")"
echo "=========================================="
echo ""

PASS=0; FAIL=0

check() {
  local name="$1"; shift
  echo ">> $name"
  if "$@"; then echo "  PASS"; PASS=$((PASS+1));
  else echo "  FAIL"; FAIL=$((FAIL+1)); fi
  echo ""
}

check "[1/6] bun install" bun install
check "[2/6] prisma generate" bunx prisma generate

if [ "$QUICK" = false ]; then
  check "[3/6] db:push" bun run db:push
else
  echo ">> [3/6] db:push - SKIPPED (--quick)"
  echo ""
fi

check "[4/6] ESLint" bun run lint

echo ">> [5/6] TypeScript (0 errors required)"
bunx tsc --noEmit 2>&1 | tee /tmp/slk-tsc.txt || true
TS_ERRORS=$(grep -c "error TS" /tmp/slk-tsc.txt 2>/dev/null || echo "0")
if [ "$TS_ERRORS" -eq 0 ]; then
  echo "  PASS (0 errors)"; PASS=$((PASS+1))
else
  echo "  FAIL ($TS_ERRORS errors)"; FAIL=$((FAIL+1))
  grep "error TS" /tmp/slk-tsc.txt
fi
echo ""

if [ "$QUICK" = false ]; then
  echo ">> [6/6] Dev server smoke test (GET / 200)"
  bunx next dev -p 3000 > /tmp/slk-dev.log 2>&1 &
  DEV_PID=$!
  READY=false
  for i in $(seq 1 60); do
    if curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "  PASS (200 after ${i}s)"; READY=true; PASS=$((PASS+1)); break
    fi
    sleep 1
  done
  kill $DEV_PID 2>/dev/null || true; wait $DEV_PID 2>/dev/null || true
  if [ "$READY" = false ]; then
    echo "  FAIL (no response in 60s)"
    FAIL=$((FAIL+1))
    echo "  ---- last 20 lines of dev log ----"
    tail -n 20 /tmp/slk-dev.log || true
  fi
  echo ""
else
  echo ">> [6/6] Dev server - SKIPPED (--quick)"
  echo ""
fi

echo "=========================================="
echo "  Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -eq 0 ]; then echo "  ALL CHECKS PASSED"; fi
echo "=========================================="
exit $FAIL
