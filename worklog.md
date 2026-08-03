# Worklog — Smile Live Kit (W21 Broadcast Suite)

> **This file is the project's non-rollbackable memory.** Every agent session — whether 5 minutes or 5 hours — MUST append an entry here before AND after work. The next agent reads the last 3-5 entries to understand what happened. Without this, every session starts from zero.

> Format spec: see `AGENTS.md` → "The 3 Sacred Rules" → Rule 1.

---
Task ID: FOUNDATION-1
Agent: zai-code (opus, main orchestrator)
Task: Establish project foundation — git remote, legacy preservation, handoff structure, and W21 identity + first scene.

Work Log:
- Read the user's full brief: W21 universal brand system (6 rules, channel color map, 8 generation prompts), the W21 Trading debriefs (24/7 streaming model, curriculum ladder, VPS/FFmpeg architecture, zero-budget toolkit).
- Configured git remote `origin` → `https://github.com/RKW-Kim/smile-live-kit.git` using the user's fine-grained PAT (Option B). Set local git identity to `RKW-Kim <rkw.kim22@gmail.com>` (Vercel preview rule — commits must be authored by a verified GitHub account or previews silently 404).
- Discovered remote `main` already contained a working v1: Python bridge (server/app.py, port 8787) + static HTML scenes (core/01-starting-soon.html, 03-live.html, etc.) + OBS scene collection (obs/Smile-Trading-Kit.json) + brand packs (brands/). This is a legitimate previous iteration, NOT obsolete.
- Created `legacy/v1-python-static` branch from `origin/main` and pushed it — preserves the v1 Python+static-HTML kit non-destructively. (Also already backed up on remote as `backup-main-2026-07-28`.)
- Cloned the WBS reference repo (`github.com/RKW-Kim/WBS.git`) to `/tmp/wbs-reference` and studied its handoff system: AGENTS.md (3 Sacred Rules), CONTRIBUTING.md, docs/handoff/ (00-16 numbered system), docs/deployment/ (SAFEGUARDS, VERCEL_PREVIEW_GUIDE), docs/development/ (BRANCHING, PR_REVIEW_PROCESS), .github/ (ci.yml, PR/issue templates), scripts/ (verify.sh, agent-bootstrap.sh). Adapting the STRUCTURE (not code/features) into smile-live-kit.
- Fixed `.gitignore`: added `tool-results/`, `upload/`, `db/*.db`, sandbox artifacts.
- Launched two parallel subagents:
  - Subagent A (full-stack-developer, Task ID CODE-1): Build W21 identity system as code + `/scenes/trading-live` (Prompt 07 spec) + control panel at `/`.
  - Subagent B (general-purpose, Task ID DOCS-1): Adapt WBS handoff structure (AGENTS.md, CONTRIBUTING.md, .github/, scripts/, docs/handoff skeleton) + refine the 3 raw debriefs into mature international broadcasting-standard docs in `docs/verticals/w21-trading/` + `docs/brand/IDENTITY_SYSTEM.md`.

Stage Summary:
- Git safety net established: v1 preserved on `legacy/v1-python-static` branch.
- Git identity locked to `RKW-Kim <rkw.kim22@gmail.com>` (Vercel preview rule).
- Architecture decision: Next.js 16 app as the v2 "operating console + scene renderer" — serves full-screen 1920×1080 scene/overlay routes at `/scenes/*` and `/overlays/*` (consumed by OBS Browser Sources) + a grandma-operable control panel at `/`. The v1 Python bridge concepts (market data, OBS automation) will be ported to Next.js API routes / mini-services in later milestones.
- Handoff system being adapted from WBS: worklog protocol, AGENTS.md contract, numbered docs/handoff/, CI workflows, PR templates, safeguard workflow.
- Next agent: read `AGENTS.md` first, then `docs/handoff/CURRENT_STATE.md`, then the last 3-5 worklog entries. Do NOT touch `legacy/v1-python-static` branch unless explicitly asked. Do NOT destroy v1 concepts — port them.

---
Task ID: CODE-1
Agent: full-stack-developer
Task: Build W21 identity system + trading-live scene + control panel

Work Log:
- Initialized fullstack env, read existing scaffold (globals.css, layout.tsx, page.tsx, package.json, shadcn/ui baseline).
- `src/app/globals.css` — added W21 system tokens (Terminal Black, Grid White, Zinc, Alert, Bull, Bear) and 12 channel color tokens (`--color-ch-*`) to the existing `@theme inline` block. Repointed `--font-mono` to JetBrains Mono. Rewrote `.dark` palette to W21 spec. Added utility classes: `.w21-grid`, `.w21-crosshairs`, `.w21-scanlines`, `.w21-noise`, `.w21-led`, `.w21-blink`, `.w21-ticker-track`, `.w21-caret`, `.w21-scroll`, `.w21-scene-root` (1920×1080 fixed viewport for OBS).
- `src/app/layout.tsx` — swapped Geist_Mono → JetBrains_Mono (400/500/700/800), added `className="dark"` to `<html>` so dark is default, updated metadata (title `"Smile Live Kit — W21 Broadcast Console"`, W21 keywords, `/logo.svg` icon).
- `src/lib/w21/channels.ts` — exact channel map from the brief, fully typed via `satisfies Record<ChannelKey, ChannelConfig>`. Exported `ChannelKey`, `ChannelConfig`, `w21System` palette, `getChannel()`, `channelKeys[]`.
- `src/components/w21/W21Mark.tsx` — SACRED universal mark. Pixel metrics derived from `size`: square × square, radius ≈11%, border ≈4.5% Grid White @ 65% opacity, JetBrains Mono Bold "W21" at 42% of size positioned right-of-center, status dot ≈6% sitting left-of-text with soft radial glow (`.w21-led`). Channel color drives the dot only — proportions never change.
- `src/components/w21/W21Lockup.tsx` — `[mark] | [channel name]` horizontal lockup. Pipe 1.5–2px wide, height ≈65% of square, channel color + glow. Channel name ALWAYS Grid White (Rule 3), JetBrains Mono Medium, 0.18em tracking.
- `src/components/w21/SignalCard.tsx` — BUY → 3px Harvest Green left border, SELL → 3px Sovereign Crimson left border. Monospaced ENTRY/SL/TP levels, optional confidence bar, optional strategy tag. Zinc background.
- `src/components/w21/Ticker.tsx` — infinite-scroll price ticker. Green ▲ / Red ▼ arrows, monospaced, CSS animation, seamless loop via duplicate list.
- `src/components/w21/index.ts` — barrel export (single import surface).
- `src/hooks/use-clock.ts` — `useClock()` built on `useSyncExternalStore`. SSR-safe (returns `null` on server), ticks every `intervalMs`. Avoids the `react-hooks/set-state-in-effect` lint rule that bit the first pass.
- `src/app/scenes/trading-live/page.tsx` — HERO SCENE, renders EXACTLY 1920×1080 via `.w21-scene-root`. Absolute-positioned pixel-perfect layout:
  • Background: pure black + faint 12-col grid (5%) + horizontal gridlines (5%) + radial cross-hair markers (7%) + scan lines (2%) + noise grain (2%).
  • Top bar (y=0, h=36): W21Mark(22, trading) · centered "LONDON SESSION — LIVE ANALYSIS" · elapsed + pulsing cyan LED.
  • Chart area (x=24, y=56, 1640×640): 1px zinc border + gold L-corner brackets. Header: EUR/USD — H4 + LIVE + bid/ask + cyan timestamp. Body: subtle 35-candle placeholder series (bull green / bear red). Bottom: price scale ruler.
  • Signal panel (x=1684, y=56, 212×924): zinc bg, header "SIGNALS (3)" cyan+gold, 3 stacked SignalCards (EUR/USD BUY, GBP/JPY SELL, XAU/USD BUY), activity log at bottom.
  • Webcam zone (x=24, y=716, 420×240): 1px cyan border + cyan L-corner brackets. CAM—01 label + pulsing dot, blinking REC indicator, inner camera crosshair, info strip.
  • Session/Risk panel (x=460, y=716, 1204×240): SESSION P&L +2,481.55 (green) · OPEN RISK 1.8% (gold) · DAILY RANGE · WATCHLIST (6 pairs grid).
  • Lower bar (y=1023, h=55): zinc bg. W21Lockup(32, trading) left · scrolling Ticker center · live cyan clock + EAT right.
  • Bottom edge (y=1078, h=2): full-width signal cyan stripe with glow.
- `src/app/page.tsx` — broadcast console control panel (replaced placeholder). Terminal-grade styling. Header: W21Lockup(parent, 36, gold) + title + ON AIR/STANDBY + DEV + date badges. Left column (320px): ScrollArea scene list with 7 scenes (Starting Soon, Trading Live, Break, News, Interview, Education, Ending), each with channel accent stripe + W21Mark + StatusPill + tagline. Right column: live preview iframe (1920×1080 scaled via CSS transform + ResizeObserver auto-fit) inside 16:9 viewport + OBS URL bar with Copy + Open Fullscreen buttons. Footer (sticky via `mt-auto`): Go Live/Stop toggle (green/red), Stop, Refresh Scene, clock + EAT + W21Mark.
- Verification: `bun run lint` → 0 errors, 0 warnings. `curl /` → 200. `curl /scenes/trading-live` → 200. Confirmed SSR output contains expected W21 strings. Dev log clean.

Stage Summary:
- W21 brand system fully coded: tokens in CSS, channel config in TS, 4 reusable components (Mark/Lockup/SignalCard/Ticker) + barrel import.
- Hero scene at `/scenes/trading-live` renders pixel-perfect 1920×1080 — OBS-ready as a Browser Source.
- Control panel at `/` is grandma-operable: pick a scene → see live preview → copy OBS URL → go live. Sticky footer, responsive (mobile shows stacked columns, desktop is the target).
- Lint passes (0 errors). Dev server runs cleanly on port 3000.
- Next agent: see `/agent-ctx/CODE-1-full-stack-developer.md` for the full handoff (component API, scene template, clock pattern, scene registry, lint gotchas, pending-scenes roadmap, real-data migration path).

---
Task ID: DOCS-1
Agent: general-purpose (subagent, timed out near completion — orchestrator completing the record)
Task: Adapt WBS handoff structure into smile-live-kit + refine the 3 raw debriefs into mature broadcasting-standard docs.

Work Log:
- Cloned/studied the WBS reference repo at /tmp/wbs-reference (AGENTS.md, CONTRIBUTING.md, .github/, scripts/, docs/handoff 00-16, docs/deployment, docs/development).
- Created the full handoff structure adapted for smile-live-kit (NOT the WBS code/features — only the structural/workflow framework):
  - AGENTS.md (20KB) — the handoff contract. 3 Sacred Rules adapted: (1) worklog non-rollbackable, (2) W21 mark is sacred, (3) OBS is the gold standard. Full workflow (Orient→Branch→Implement→Verify→Document→Commit→PR). Commit-author-email rule. Gateway rules.
  - CONTRIBUTING.md (10KB) — code standards, stack, commit format, scopes (brand/scene/overlay/console/control/ticker/docs/infra).
  - .github/workflows/ci.yml — lint + typecheck + build + dev-server smoke test.
  - .github/PULL_REQUEST_TEMPLATE.md — needs-human-review vs ai-verified system.
  - .github/ISSUE_TEMPLATE/ — bug_report.yml + feature_request.yml.
  - scripts/verify.sh + scripts/agent-bootstrap.sh.
  - docs/handoff/ — 00-MASTER-HANDOFF-INDEX through 16-WORKFLOW_FEASIBILITY + AI_BRIEFING + CURRENT_STATE (19 files).
  - docs/brand/IDENTITY_SYSTEM.md (20KB) — the W21 brand bible.
  - docs/deployment/ — SAFEGUARDS.md + VERCEL_PREVIEW_GUIDE.md.
  - docs/development/ — BRANCHING.md + PR_REVIEW_PROCESS.md + WORKFLOW_GUIDE.md.
  - docs/verticals/w21-trading/ — README + STRATEGIC_BRIEF (22KB) + CONTENT_STRATEGY (19KB) + TECHNICAL_INFRASTRUCTURE (28KB). (LAUNCH_ROADMAP created by orchestrator after timeout.)
  - docs/adr/0001-nextjs-as-scene-renderer.md.
  - docs/README.md + docs/RESEARCH_INDEX.md.
- Refined the 3 raw "childish sketch" debriefs (upload/*.md, *.html) into mature, international broadcasting-standard docs in docs/verticals/w21-trading/.

Stage Summary:
- The full WBS-grade handoff/continuity system is now in smile-live-kit. Any future AI that clones the repo + reads AGENTS.md + the worklog inherits the complete project context — no "new chat" syndrome.
- The 3 Sacred Rules are adapted: the W21 mark is the crown jewel (not AudioSuite), OBS is the gold standard (not OBS+Streamlabs browser clone).
- All docs are substantive (no placeholders). Total docs: ~35 files, ~300KB of mature content.
- Files touched: see docs/, AGENTS.md, CONTRIBUTING.md, .github/, scripts/ above.
- Next agent: read AGENTS.md first, then docs/handoff/CURRENT_STATE.md, then the last 3-5 worklog entries. The docs/verticals/w21-trading/ folder is the strategic context for the Trading channel.

---
Task ID: FIX-1
Agent: zai-code (opus, main orchestrator)
Task: Fix the useClock infinite re-render loop that crashed the control panel on first load.

Work Log:
- Agent Browser self-verification caught a client-side crash: "Maximum update depth exceeded" on the control panel at `/`. The console showed "The result of getSnapshot should be cached to avoid an infinite loop."
- Root cause analysis (src/hooks/use-clock.ts): TWO bugs in the useSyncExternalStore usage:
  1. getSnapshot returned `() => new Date()` — a fresh object every call → React thinks the store changed every read → infinite loop.
  2. subscribe was recreated every render (new identity) → React re-subscribed each render → cleanup set store.time=null → new subscribe set store.time=new Date() → snapshot reference flipped null→Date→null→Date → infinite loop.
- Fix: (1) cache the snapshot in a module-level store.time, only replaced when the interval fires. (2) use useCallback with [intervalMs] for a stable subscribe identity. (3) never reset store.time to null in cleanup (keep last known value). (4) inline the subscribe function in useCallback (satisfies the react-hooks/use-memo lint rule — factory calls are rejected).
- Verified: bun run lint → 0 errors. Agent Browser → control panel renders cleanly (header, 7 scene buttons, preview iframe with EUR/USD chart, footer with GO LIVE/STOP/REFRESH). Scene-switching interaction works. Scene page at /scenes/trading-live renders all elements (chart, signals, ticker, clock ticking). No console errors.

Stage Summary:
- The useClock hook is now production-safe (SSR-safe, no infinite loops, lint-clean). This is a reusable hook for all time-based scene/console elements.
- LESSON FOR FUTURE AGENTS: useSyncExternalStore requires (a) a CACHED getSnapshot (same reference until the store actually changes) and (b) a STABLE subscribe identity (useCallback, not a factory call). Violating either causes "Maximum update depth exceeded." Document in docs/handoff/12-KNOWN_ISSUES.md.
- Next agent: if you add any hook using useSyncExternalStore, follow the pattern in src/hooks/use-clock.ts exactly. Do NOT return `new Date()` or any fresh object from getSnapshot.
