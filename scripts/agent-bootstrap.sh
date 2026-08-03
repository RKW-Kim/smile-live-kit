#!/usr/bin/env bash
# agent-bootstrap.sh - Bootstrap Smile Live Kit dev environment from a bare sandbox.
# Usage: bash scripts/agent-bootstrap.sh
#
# What this does:
#   1. Installs bun if missing.
#   2. Sets the git author to RKW-Kim <rkw.kim22@gmail.com> (REQUIRED for Vercel
#      previews — see docs/deployment/VERCEL_PREVIEW_GUIDE.md).
#   3. Resolves DATABASE_URL (defaults to ./prisma/dev.db if .env is absent).
#   4. bun install
#   5. prisma generate + db:push
#   6. Quick verification (lint + tsc).
#   7. Prints the next-step instructions.
set -euo pipefail

echo ""
echo "=========================================="
echo "  Smile Live Kit — Agent Bootstrap"
echo "=========================================="
echo ""

# ── 1. bun ──────────────────────────────────────────────────────────
if command -v bun &>/dev/null; then
  echo "bun $(bun --version) already installed"
else
  echo "Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo "bun $(bun --version) installed"
fi

# ── 2. git identity (REQUIRED for Vercel previews) ─────────────────
# A wrong commit-author email silently 404s every preview deployment.
# See docs/deployment/VERCEL_PREVIEW_GUIDE.md.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if [ "$(git config user.email)" != "rkw.kim22@gmail.com" ]; then
  echo "Setting git author to RKW-Kim <rkw.kim22@gmail.com> (required for Vercel previews)..."
  git config user.name "RKW-Kim"
  git config user.email "rkw.kim22@gmail.com"
fi
echo "git author: $(git config user.name) <$(git config user.email)>"
echo ""

# ── 3. DATABASE_URL ─────────────────────────────────────────────────
if [ -z "${DATABASE_URL:-}" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
  export DATABASE_URL="file:$PROJECT_ROOT/prisma/dev.db"
fi
echo "DATABASE_URL=${DATABASE_URL:-(from .env)}"
echo ""

# ── 4. Install dependencies ────────────────────────────────────────
echo "Installing dependencies..."
bun install
echo "Dependencies installed"
echo ""

# ── 5. Prisma ───────────────────────────────────────────────────────
echo "Generating Prisma client..."
bunx prisma generate
echo "Prisma client generated"

echo "Pushing DB schema..."
bun run db:push
echo "DB schema pushed"
echo ""

# ── 6. Quick verification ───────────────────────────────────────────
echo "Quick verification..."
bun run lint && echo "Lint: PASS" || echo "Lint: has errors"
bunx tsc --noEmit 2>&1 | tail -5 || true
echo ""

# ── 7. Next steps ───────────────────────────────────────────────────
echo "=========================================="
echo "  Bootstrap complete!"
echo ""
echo "  Next steps:"
echo "    1. Read AGENTS.md (the handoff contract)"
echo "    2. Read docs/handoff/CURRENT_STATE.md (what's done, what's next)"
echo "    3. Read the last 3-5 entries at the bottom of worklog.md"
echo "    4. Start the dev server: bun run dev"
echo "    5. Verify: bash scripts/verify.sh"
echo ""
echo "  Before your first commit, confirm:"
echo "    git config user.email   # must print: rkw.kim22@gmail.com"
echo ""
echo "  Docs map: docs/handoff/00-MASTER-HANDOFF-INDEX.md"
echo "=========================================="
