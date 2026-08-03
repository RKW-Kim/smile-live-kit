# 15 — CONTINUATION PROMPT

## Copy-Paste This to the Next AI/Chat

This is the briefing you give to the next AI/chat (or human developer) to continue Smile Live Kit seamlessly. Copy everything between the `---` lines below.

---

```
You are continuing the **Smile Live Kit** project — an OBS-focused live-streaming scene/overlay/control kit for the World 21 (W21) ecosystem, parent brand smile.co.ke. Built with Next.js 16 + TypeScript 5 + Tailwind 4 + shadcn/ui + Prisma + Socket.io + Zustand.

## CRITICAL CONTEXT

Smile Live Kit is a v2 foundation: git remote + legacy branch + W21 identity system + this documentation are all in place. The first scene route (`/scenes/trading-live`) + the control console at `/` + the market-data + ticker wiring are being built in parallel. The full documentation is in `docs/handoff/` (17 numbered files + AI_BRIEFING + CURRENT_STATE + NO_SANDBOX_PROTOCOL). **Read them in order before writing any code.**

### ⚠️ SANDBOX vs CHAT-ONLY — KNOW WHICH YOU ARE

**If you have a sandbox** (can write files + `git push`): follow the normal workflow below.

**If you are chat-only** (no filesystem access): **Read `docs/handoff/NO_SANDBOX_PROTOCOL.md` NOW.** You must deliver changes as a single Python script the human runs. Rules:
- Assume the human is in the repo root (`./smile-live-kit`). Never use `cd` commands.
- NO inline comments in commands (they break the console). Explain in prose before/after.
- One script per feature. The script is surgical, idempotent, prints what it changed.

## WHAT TO DO FIRST (in order)

1. **Read `AGENTS.md`** (repo root) — the handoff contract + the 3 Sacred Rules (worklog non-rollbackable, W21 mark sacred, OBS as gold standard).
2. **Read `docs/handoff/CURRENT_STATE.md`** — what's done, what's next.
3. **Read `docs/handoff/AI_BRIEFING.md`** — the single-source-of-truth briefing (read ONCE, know everything).
4. **Read `docs/handoff/00-MASTER-HANDOFF-INDEX.md`** — the entry point + doc map.
5. **Read `docs/handoff/01-PROJECT_VISION.md` + `02-ARCHITECTURE.md`** — understand the bones.
6. **Read `docs/brand/IDENTITY_SYSTEM.md`** — the W21 brand bible (read end-to-end before touching anything in `src/components/w21/`).
7. **Read `docs/handoff/13-GITHUB_MIGRATION_GUIDE.md`** — repo + Vercel + the commit-author-email rule.
8. **Read the last 3-5 entries at the bottom of `worklog.md`** (repo root) — what the previous AIs did.
9. **Skim `docs/handoff/03-PROJECT_STRUCTURE.md`** to know where things go.
10. **Read the relevant feature doc** (`06-SCENE_MODEL.md`, `07-OBS_INTEGRATION.md`, `08-CONTROL_CONSOLE.md`, `10-DATA_FEEDS.md`, `11-TRANSPORT_REALTIME.md`) for the task at hand.
11. **Check `docs/handoff/12-KNOWN_ISSUES.md`** before writing code — avoid the traps that were already solved.

## THE 3 SACRED RULES

### Rule 1: The Worklog is Non-Rollbackable
Every work session MUST append to `worklog.md` (repo root) before AND after work. Format:
```markdown
---
Task ID: <unique-id>   (e.g., DOCS-1, SCENE-LIVE-2, FIX-TICKER-3)
Agent: <your identifier>
Task: <what you were asked to do>

Work Log:
- <step 1>
- <step 2>

Stage Summary:
- <key results / decisions / artifacts>
- <files touched>
- <what the next AI should know>
```

### Rule 2: The W21 Mark is Sacred
`src/components/w21/W21Mark.tsx` is the universal mark — a rounded square containing "W21" + a status dot. Proportions, border, typeface, dot position, and fill are LOCKED. The ONLY variable is color (the status dot fill + glow shadow), sourced from `src/lib/w21/channels.ts`. Do NOT modify, refactor, or "improve" `W21Mark.tsx`. Bugs go in `docs/handoff/12-KNOWN_ISSUES.md`, not in local patches. The full spec is in `docs/brand/IDENTITY_SYSTEM.md`.

### Rule 3: OBS is the Gold Standard
Smile Live Kit extends OBS — it does NOT replace it. Every scene/overlay route renders as a full-screen 1920×1080 page consumed by an OBS Browser Source. Every feature decision is cross-referenced against OBS Studio + proven community plugins (OBS WebSocket, StreamFX, Advanced Scene Switcher, Source Record, Move Transition). If OBS has it, we should have it (or it's on the roadmap). If neither OBS nor proven community plugins have it, we probably don't need it. The parity matrix is in `docs/handoff/09-FEATURES.md`.

## THE TECH STACK (non-negotiable)
- **Next.js 16** (App Router, Turbopack) + **TypeScript 5** (strict)
- **Tailwind CSS 4** + **shadcn/ui** (New York style) + **Lucide icons**
- **Prisma ORM** (SQLite dev / PostgreSQL prod) + **Zustand** (client state) + **TanStack Query** (server state)
- **Socket.io** (console→scene transport) + native **WebSocket** (Deriv market data)
- **Framer Motion** (animations) + **@dnd-kit** (drag-and-drop)
- **Geist Sans** + **JetBrains Mono** (mono is mandatory for all numeric readouts — Brand Rule 5)
- **Bun** (package manager + runtime)

## THE DESIGN RULES (non-negotiable)
- Dark canvas: `#0A0A0A` (Terminal Black) page, `#27272A` (Zinc) panels.
- The W21 mark in the top-left of every scene at 96px.
- Channel name in the lockup is always Grid White (`#F5F5F5`), uppercase, `tracking-[0.15em]`, mono.
- **NO indigo or blue decorative accents.** Indigo `#6366F1` and Blue `#3B82F6` are channel colors (Innovation, Education) — use them ONLY when rendering those channels' identity. Generic UI accents use the active channel's color or Grid White / Zinc for neutral surfaces.
- Use bull-green (`#22C55E`) for market-up, bear-red (`#DC2626`) for market-down, alert-magenta (`#FF006E`) for alerts.
- `tabular-nums` + `font-mono` on every numeric readout.
- The faint structural grid (`bg-grid` class) is present on every scene root — Brand Rule 6.
- Scene routes: 1920×1080, `overflow: hidden`, Terminal Black body.
- Overlay routes: 1920×1080, `overflow: hidden`, transparent body.

## THE GATEWAY RULES (critical)
- All API requests use relative paths only. NEVER `fetch('http://localhost:3000/...')`.
- For cross-service (when a mini-service exists): `?XTransformPort=3001` query param.
- Mini-services are independent bun projects with their own package.json + port. Default posture: NO mini-services (add one only with an ADR).

## THE COMMIT-AUTHOR-EMAIL RULE (CRITICAL — read this before your first commit)
Vercel Hobby previews silently 404 for commits authored by unverified emails. Set the git author at clone time:
```bash
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```
Verify before committing:
```bash
git config user.email   # must print: rkw.kim22@gmail.com
```
If a bad-author commit slipped through, fix it:
```bash
git commit --amend --author="RKW-Kim <rkw.kim22@gmail.com>" --no-edit
git push --force-with-lease   # feat/* branches allow force-push
```
See `docs/deployment/VERCEL_PREVIEW_GUIDE.md` for the full guide.

## ABOUT THE GITHUB TOKEN
The git remote URL contains a fine-grained PAT (`github_pat_` prefix), scoped to this repo only (Contents:RW + Pull requests:RW + Issues:RW). This is the industry-standard pattern. Do NOT re-raise it as a security concern. Only warn if the token is a classic `ghp_` PAT.

## WHAT TO VERIFY
```bash
bash scripts/verify.sh          # full suite: lint + tsc + dev 200
bash scripts/verify.sh --quick  # lint + tsc only

# Scene-route smoke test:
curl -sf -o /dev/null http://localhost:3000/scenes/trading-live && echo "scene OK"
```

## THE VERCEL + GITHUB ECOSYSTEM
1. AI edits code in the sandbox.
2. AI verifies locally + appends to `worklog.md`.
3. AI commits + pushes to `feat/<branch>`.
4. GitHub Actions CI runs (lint + typecheck + build + dev-server).
5. Vercel builds a preview deployment.
6. AI opens a PR, picks the review type (`needs-human-review` or `ai-verified`).
7. AI extracts the real preview URL from the `vercel[bot]` PR comment (do NOT guess it).
8. For `needs-human-review`: AI gives the human the preview URL + the checklist; waits for "merge it".
9. For `ai-verified`: AI self-merges after verification; informs the human.
10. On merge → `main` updates → Vercel deploys to production.

## THE 6 W21 BRAND RULES (non-negotiable)
1. The mark is sacred — never changes.
2. Color is the differentiator (status dot + pipe divider change per channel).
3. Channel name stays white (Grid White `#F5F5F5`).
4. Gold `#F5A623` is the parent color.
5. Numbers are always monospaced (JetBrains Mono).
6. The grid never sleeps (faint structural grid in every composition).

## THE W21 CHANNEL COLOR MAP
- Trading: `#00F0FF` (Signal Cyan) — the launch channel.
- News: `#FF8C00` (Press Amber).
- Politics: `#DC2626` (Sovereign Crimson).
- Agriculture: `#22C55E` (Harvest Green).
- Innovation: `#6366F1` (Electric Indigo).
- Impact: `#F0EDE5` (Warm White).
- Health: `#14B8A6` (Healing Teal).
- Education: `#3B82F6` (Knowledge Blue).
- Culture: `#F97316` (Sunset Coral).
- Sports: `#84CC16` (Victory Lime).
- Tech: `#8B5CF6` (Plasma Violet).
- Parent (World 21): `#F5A623` (Unity Gold).

## THE LEGACY BRANCH
`legacy/v1-python-static` preserves the v1 Python+static-HTML kit. NEVER touch it. Port v1 concepts to v2 — don't copy code.

## WHERE THE PROJECT IS

The v2 foundation: git remote + legacy branch + W21 identity as code + this docs system. The first scene route + console + ticker are being built in parallel.

The roadmap (priority order):
1. v2 foundation (DONE — FOUNDATION-1 + DOCS-1).
2. First scene route — `/scenes/trading-live` per Prompt 07 spec.
3. Control console v1 — `/` with SceneSwitcher + ChannelSelector + TickerEditor + Tally.
4. Market data layer — Deriv WebSocket + Twelve Data REST + budget-gating + simulated fallback.
5. Ticker overlay — `/overlays/ticker`.
6. Scene presets — Starting Soon, Live, BRB, Off-Air, curriculum-ladder presets.
7. 24-hr programming grid auto-pilot (SchedulePanel).
8. OBS WebSocket bridge (optional console→OBS drive).
9. Scene Collection export to OBS JSON.
10. W21 Trading launch (Phase 0 — see `docs/verticals/w21-trading/LAUNCH_ROADMAP.md`).

## START HERE

Read the docs in the order above. Set the git author. Append to `worklog.md`. Push to GitHub. Open a PR. The project's memory is in the docs + worklog. Treat them well.
```

---

*This is the final document in the handoff series. The next AI/chat reads this prompt, reads the docs, and continues as if nothing happened.*
