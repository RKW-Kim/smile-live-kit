# CURRENT STATE — Last Updated: 2026-08-03

> **This file is the "where are we right now" snapshot.** Any AI reading this immediately knows what's done, what's broken, and what to do next. **Update this file at the end of every work session.**

---

## ✅ What's Done

### FOUNDATION-1 — Project Foundation (zai-code, main orchestrator)
- ✅ Read the user's full brief: W21 universal brand system (6 rules, channel color map, 8 generation prompts), the W21 Trading debriefs (24/7 streaming model, curriculum ladder, VPS/FFmpeg architecture, zero-budget toolkit).
- ✅ Configured git remote `origin` → `https://github.com/RKW-Kim/smile-live-kit.git` using the user's fine-grained PAT (Option B). Set local git identity to `RKW-Kim <rkw.kim22@gmail.com>` (Vercel preview rule).
- ✅ Discovered remote `main` already contained a working v1: Python bridge (server/app.py, port 8787) + static HTML scenes + OBS scene collection + brand packs. This is a legitimate previous iteration.
- ✅ Created `legacy/v1-python-static` branch from `origin/main` and pushed it — preserves the v1 kit non-destructively.
- ✅ Cloned the WBS reference repo to `/tmp/wbs-reference/` and studied its handoff system: AGENTS.md (3 Sacred Rules), CONTRIBUTING.md, docs/handoff/ (00-16 numbered system), docs/deployment/, docs/development/, .github/, scripts/.
- ✅ Fixed `.gitignore`: added `tool-results/`, `upload/`, `db/*.db`, sandbox artifacts.
- ✅ Launched two parallel subagents:
  - **Subagent A** (full-stack-developer, Task ID `CODE-1`): Build W21 identity system as code + `/scenes/trading-live` (Prompt 07 spec) + control panel at `/`.
  - **Subagent B** (general-purpose, Task ID `DOCS-1`): Adapt WBS handoff structure + refine the 3 raw debriefs into mature international broadcasting-standard docs.

### DOCS-1 — Documentation System (this subagent)
- ✅ `AGENTS.md` — the handoff contract (3 Sacred Rules: worklog, W21 mark, OBS as gold standard; workflow; gateway rules; commit-author-email rule).
- ✅ `CONTRIBUTING.md` — stack, code standards, PR process, mini-services pattern.
- ✅ `.github/workflows/ci.yml` — CI: lint (blocking) + typecheck (0 errors) + build + dev-server 200. Uses `oven-sh/setup-bun@v2`. Env: `DATABASE_URL: "file:./prisma/test.db"`.
- ✅ `.github/PULL_REQUEST_TEMPLATE.md` — needs-human-review vs ai-verified routing + the AI verification checklist.
- ✅ `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml` — adapted from WBS, with OBS parity dropdown on feature requests.
- ✅ `scripts/verify.sh` — full suite (bun install + prisma + lint + tsc + dev 200) with `--quick` flag.
- ✅ `scripts/agent-bootstrap.sh` — bare-sandbox bootstrap (bun + git identity + prisma + verify).
- ✅ `docs/README.md` — docs map + reading order.
- ✅ `docs/RESEARCH_INDEX.md` — catalog of all research + how it informs features.
- ✅ `docs/handoff/00-MASTER-HANDOFF-INDEX.md` through `16-WORKFLOW_FEASIBILITY.md` — 17 numbered handoff docs.
- ✅ `docs/handoff/AI_BRIEFING.md` — single-source-of-truth briefing.
- ✅ `docs/handoff/CURRENT_STATE.md` — this file.
- ✅ `docs/brand/IDENTITY_SYSTEM.md` — the W21 brand bible.
- ✅ `docs/deployment/SAFEGUARDS.md` + `VERCEL_PREVIEW_GUIDE.md`.
- ✅ `docs/development/BRANCHING.md` + `PR_REVIEW_PROCESS.md` + `WORKFLOW_GUIDE.md`.
- ✅ `docs/adr/0001-nextjs-as-scene-renderer.md`.
- ✅ `docs/verticals/w21-trading/README.md` + `STRATEGIC_BRIEF.md` + `CONTENT_STRATEGY.md` + `TECHNICAL_INFRASTRUCTURE.md` + `LAUNCH_ROADMAP.md` — refined from the 3 raw debriefs (Full + Comprehensive + Strategic HTML) into mature international broadcasting-standard docs.

### W21 Identity System (code — built by the code subagent, CODE-1)
- ✅ `src/lib/w21/channels.ts` — the channel color map (12 channels + parent) + system colors. Single source of truth.
- ✅ `src/components/w21/W21Mark.tsx` — the universal mark (Rule 2 — sacred). Rounded square + "W21" + status dot, scales from 24px to 96px+.
- ✅ `src/components/w21/W21Lockup.tsx` — mark + pipe + channel name (channel name always Grid White).
- ✅ `src/app/layout.tsx` — root layout, dark theme, Geist Sans + JetBrains Mono fonts, Toaster.

---

## 🚧 What's In Progress / Being Built in Parallel

### CODE-1 — The code subagent (full-stack-developer)
Building (in parallel with this docs subagent):
- `/scenes/trading-live` — the W21 Trading live trade scene per Prompt 07 spec (W21 lockup in top-left, live price readout center, ticker bottom, faint structural grid, channel cyan as the only chromatic accent).
- `/` (control console v1) — SceneSwitcher + ChannelSelector + TickerEditor + TallyIndicator (basic).
- The supporting `src/components/scene/SceneFrame.tsx`, `src/components/scene/OverlayFrame.tsx`, and the basic console panels.

**Status:** in flight. Check the code subagent's worklog entry for the final artifacts.

---

## ❌ What's Missing (Roadmap, Priority Order)

1. **Market data layer** — Deriv WebSocket client (`src/lib/data/deriv.ts`), Twelve Data REST client (`src/lib/data/twelvedata.ts`), budget-gating layer (`src/lib/data/budgetGate.ts`). See `docs/handoff/10-DATA_FEEDS.md`.
2. **Ticker overlay** — `/overlays/ticker`. Transparent body, live market data, scrolls at 60px/sec.
3. **Socket.io transport** — `src/lib/transport/socketServer.ts` + `socketClient.ts` + `events.ts`. See `docs/handoff/11-TRANSPORT_REALTIME.md`.
4. **Scene presets** — Starting Soon, Live, Be Right Back, Off Air, curriculum-ladder presets. Prisma model + CRUD API + console UI.
5. **SchedulePanel + 24-hr grid auto-pilot** — the 24-hr programming grid for W21 Trading. See `docs/verticals/w21-trading/CONTENT_STRATEGY.md`.
6. **StreamHealthPanel** — bitrate, dropped frames, uptime, CPU. Via OBS WebSocket (when configured) or YouTube Live API.
7. **OBS WebSocket bridge** — `obs-websocket-js`. Console drives OBS (cut, transition, scene switch).
8. **Scene Collection export** — `POST /api/scene/export-obs` generates OBS JSON.
9. **Prisma schema** — `prisma/schema.prisma` with `ScenePreset`, `PriceSnapshot`, `Schedule`, `Journal`, `Setting` models. (The v2 foundation has the schema file but it may be minimal — extend it as features land.)
10. **W21 Trading launch** — Phase 0 pre-launch checklist. See `docs/verticals/w21-trading/LAUNCH_ROADMAP.md`.

---

## 🎯 What The Next AI Should Do

### Option A: Continue the code build (highest-value next pass)
Pick up where the code subagent (CODE-1) left off:
1. Read CODE-1's worklog entry.
2. Verify the scene route + console render locally: `bun run dev` + `curl -sf http://localhost:3000/scenes/trading-live`.
3. Pick the next roadmap item (market data layer is the natural next step — it unblocks the ticker).
4. Implement, verify, worklog, commit, push, PR.

### Option B: Build the market data layer
1. Read `docs/handoff/10-DATA_FEEDS.md`.
2. Implement `src/lib/data/deriv.ts` (Deriv WebSocket client).
3. Implement `src/lib/data/twelvedata.ts` (Twelve Data REST client, cached, budget-aware).
4. Implement `src/lib/data/budgetGate.ts` (daily budget + simulated fallback).
5. Implement `src/app/api/data/deriv/route.ts` + `twelvedata/route.ts` (REST shims).
6. Wire the Ticker component to use `useMarketData`.

### Option C: Build the Socket.io transport
1. Read `docs/handoff/11-TRANSPORT_REALTIME.md`.
2. Decide the deployment target (Vercel Edge, separate host, or SSE fallback). Write an ADR.
3. Implement `src/lib/transport/socketServer.ts` + `socketClient.ts` + `events.ts`.
4. Implement `src/components/transport/TransportProvider.tsx`.
5. Wire the console to emit + the scenes to listen.

### Option D: Build the scene presets library
1. Read `docs/handoff/06-SCENE_MODEL.md` §"Scene Presets".
2. Implement the preset routes: `/scenes/starting-soon`, `/scenes/be-right-back`, `/scenes/off-air`.
3. Implement the Prisma `ScenePreset` model.
4. Implement `src/app/api/scene/presets/route.ts` (CRUD).
5. Wire the console's `Presets` panel.

---

## 🔑 Key Decisions (Don't Re-Litigate)

1. Next.js App Router as the scene renderer (ADR-0001).
2. OBS as the encoder — Smile Live Kit extends OBS, not replaces it.
3. The 6 W21 brand rules are non-negotiable. The mark is sacred.
4. The channel color map lives in `src/lib/w21/channels.ts` and nowhere else.
5. The fine-grained PAT in the git remote is intentional — don't flag it.
6. The commit-author email must be `rkw.kim22@gmail.com` for Vercel previews.
7. The `legacy/v1-python-static` branch is frozen — don't touch it.
8. Single Next.js app, no mini-services unless an ADR justifies one.
9. Socket.io for console→scene transport; native WebSocket for Deriv market data.
10. Dark theme only. No indigo/blue decorative accents. Mono on all numeric readouts.

---

## 📋 Audit History

(No audits run yet. When the first S&D audit round runs, document it here — see WBS CONTRIBUTING.md §"S&D Audit Process" for the template.)

---

*Update this file at the end of every work session. The next AI reads this first.*
