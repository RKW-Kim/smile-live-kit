# AI_BRIEFING — The Complete, Context-Efficient Handoff

> **This file is the single source of truth for any AI continuing Smile Live Kit.** It is written to be so detailed and self-contained that no AI ever needs to ask "what were we doing?" — the answer is here, with exact files, exact decisions, exact reasons, and exact next steps. Read this ONCE and you know everything.

---

## 0. YOU ARE NOT A NEW CHAT

This project has been engineered for seamless AI-to-AI handoff. The worklog (`/worklog.md` at repo root) is the non-rollbackable memory. The docs (`docs/handoff/` + `docs/brand/` + `docs/verticals/`) are the frozen architecture. The code (`src/`) is the artifact. When you start, you inherit ALL of it. You are continuing, not starting.

**The 3 Sacred Rules (non-negotiable):**
1. **The worklog is non-rollbackable** — append before AND after every task. Never delete.
2. **The W21 mark (`src/components/w21/W21Mark.tsx`) is never touched** — it is the universal brand mark. The ONLY variable is color (per channel). The full spec is in `docs/brand/IDENTITY_SYSTEM.md`.
3. **OBS is the gold standard** — every feature traces to OBS or a proven community plugin. Smile Live Kit extends OBS, not replaces it.

---

## 1. WHAT THE PROJECT IS

**Smile Live Kit** is an OBS-focused live-streaming scene/overlay/control kit for the **World 21 (W21)** ecosystem. Parent brand: smile.co.ke.

The kit renders full-screen 1920×1080 scenes and overlays as Next.js routes (`/scenes/*`, `/overlays/*`) that OBS consumes as Browser Sources, plus a grandma-operable control console at `/` that drives those routes in real time via Socket.io. The launch vertical is **W21 Trading** — a 24/7 YouTube trading-education channel for Kenya/East Africa + global audience.

**Tech stack (exact):**
- Next.js 16 (App Router, Turbopack) + TypeScript 5 (strict)
- Tailwind CSS 4 + shadcn/ui (New York style) + Lucide icons
- Prisma ORM (SQLite dev / PostgreSQL prod) + Zustand (client state) + TanStack Query (server state)
- Socket.io (console→scene transport) + native WebSocket (Deriv market data)
- Framer Motion (animations) + @dnd-kit (drag-and-drop)
- Geist Sans + JetBrains Mono (mono is mandatory for all numeric readouts — Brand Rule 5)
- Bun (package manager + runtime)

**Files to know:**
- `AGENTS.md` (repo root) — the handoff contract.
- `CONTRIBUTING.md` (repo root) — stack, code standards, PR process.
- `src/components/w21/W21Mark.tsx` — the universal mark (SACRED).
- `src/lib/w21/channels.ts` — the channel color map (single source of truth).
- `docs/handoff/CURRENT_STATE.md` — what's done, what's next.
- `docs/brand/IDENTITY_SYSTEM.md` — the brand bible.
- `docs/verticals/w21-trading/` — the launch channel's strategic/content/technical/launch docs.

---

## 2. THE ARCHITECTURE (5 Core Systems)

### System 1: Scene Router — Next.js App Router as a Scene/Overlay Renderer
Every route under `src/app/scenes/*` and `src/app/overlays/*` is a self-contained 1920×1080 page. Scenes wrap in `<SceneFrame channel="...">`; overlays wrap in `<OverlayFrame>`. The OBS operator adds each route as a Browser Source.

### System 2: W21 Identity System — Brand as Code
`src/lib/w21/channels.ts` is the single source of truth for channel colors. `W21Mark.tsx` (sacred — Rule 2) + `W21Lockup.tsx` compose the brand identity. The 6 brand rules + the channel color map + the system colors are encoded as TypeScript + Tailwind conventions.

### System 3: Data Layer — Market Data via WebSocket + REST, Budget-Gated
Deriv WebSocket for synthetic indices (push-based, no polling). Twelve Data REST for forex (cached, budget-aware — 800 credits/day on free tier, 30s cache TTL). Simulated fallback (labeled "SIM" in UI) when the budget is exhausted. The data layer is server-side; the browser sees only Socket.io `data:tick` events.

### System 4: Control Console — Grandma-Operable Panel at `/`
The console is the operator's surface. Panels: SceneSwitcherPanel, ChannelSelector, TickerEditor, TallyIndicator, StreamHealthPanel, SchedulePanel, Presets panel. Big hit targets (44×44 min), no jargon, always-visible state, forgiving (10-step undo history), phone-friendly (right rail collapses).

### System 5: Transport — Socket.io for Console→Scene State
Socket.io server attached to the Next.js app (or on a separate persistent host — see `13-GITHUB_MIGRATION_GUIDE.md` §5). Essence-separated events: `state:*` (at-least-once), `ticker:*` (at-most-once), `data:*` (at-most-once), `presence:*` (best-effort), `chat:*` (future). Rooms keyed by route (`scene:trading-live`, `overlay:ticker`).

See `docs/handoff/02-ARCHITECTURE.md` for the full spec.

---

## 3. THE W21 BRAND SYSTEM (Read `docs/brand/IDENTITY_SYSTEM.md` End-to-End)

### The Universal Mark
A rounded square containing "W21" + a colored status dot. The mark NEVER changes — proportions (square radius ≈ 11% of width, border weight ≈ 4.5%, "W21" glyph height ≈ 62%, dot diameter ≈ 6% sitting left of "W" with vertical centering, soft radial glow at ~16% radius), border color (Grid White #F5F5F5 at ~65%), fill (Terminal Black #0A0A0A), typeface (JetBrains Mono Bold) are all LOCKED.

The ONLY variable across channels is **color** — the status dot fill + the glow shadow. Sourced from `src/lib/w21/channels.ts`.

### The 6 Brand Rules (Non-Negotiable)
1. The mark is sacred — never changes.
2. Color is the differentiator (status dot + pipe divider change per channel).
3. Channel name stays white (Grid White #F5F5F5).
4. Gold #F5A623 is the parent color.
5. Numbers are always monospaced (JetBrains Mono).
6. The grid never sleeps (faint structural grid in every composition).

### The Channel Color Map (12 channels + parent)
- Trading: #00F0FF (Signal Cyan) — LAUNCH CHANNEL.
- News: #FF8C00 (Press Amber). Politics: #DC2626 (Sovereign Crimson). Agriculture: #22C55E (Harvest Green). Innovation: #6366F1 (Electric Indigo). Impact: #F0EDE5 (Warm White). Health: #14B8A6 (Healing Teal). Education: #3B82F6 (Knowledge Blue). Culture: #F97316 (Sunset Coral). Sports: #84CC16 (Victory Lime). Tech: #8B5CF6 (Plasma Violet).
- Parent (World 21): #F5A623 (Unity Gold).

### The System Colors
- Terminal Black: #0A0A0A (page background, mark fill).
- Grid White: #F5F5F5 (text, borders, mark border, channel name).
- Zinc: #27272A (panels, dividers).
- Alert Magenta: #FF006E (alerts, breaking news, error states).
- Bull: #22C55E (market up). Bear: #DC2626 (market down).

### Hard Rules
- Never modify `W21Mark.tsx`. (Rule 2.)
- Never hard-code a channel color. Always `getChannel(channel).color` or `var(--w21-active)`.
- Never use indigo/blue as decorative accents — they are channel colors (Innovation, Education).
- Never use a non-mono font for a numeric readout. (Rule 5.)
- Never omit the structural grid from a scene. (Rule 6.)

---

## 4. THE OBS INTEGRATION MODEL (Read `docs/handoff/07-OBS_INTEGRATION.md`)

Every Smile Live Kit scene/overlay is a URL. The OBS operator adds it as a Browser Source at 1920×1080. Optionally, the console drives OBS via the OBS WebSocket protocol (`obs-websocket-js`).

### URL patterns
- Scenes: `https://smile-live-kit.vercel.app/scenes/<name>` — Terminal Black body.
- Overlays: `https://smile-live-kit.vercel.app/overlays/<name>` — Transparent body.
- Console: `https://smile-live-kit.vercel.app/` — the operator's surface.

### OBS Browser Source settings
- Width: 1920, Height: 1080, FPS: 60.
- Custom CSS: leave the OBS default (transparent body for overlays).
- "Shutdown source when not visible": ✅ (saves CPU).
- "Refresh browser when scene becomes active": ✅ (re-hydrates on activation).

### The deployment patterns
1. **Vercel-hosted (default):** Smile Live Kit on Vercel, OBS Browser Sources point at the Vercel URL.
2. **Self-hosted VPS:** For the 24/7 W21 Trading deployment — Smile Live Kit + FFmpeg on the same VPS, lower latency, immune to Vercel cold starts.
3. **Hybrid (recommended for 24/7):** Smile Live Kit on Vercel for live sessions; FFmpeg loops pre-recorded VOD (with W21 branding baked in) for 24/7 fill.

---

## 5. THE WORKFLOW (Read `AGENTS.md` End-to-End)

### Step 1: Orient
Read `AGENTS.md` → `docs/handoff/CURRENT_STATE.md` → last 3-5 worklog entries → the relevant feature doc → `docs/handoff/12-KNOWN_ISSUES.md` → `docs/brand/IDENTITY_SYSTEM.md` (if touching anything in `src/components/w21/`).

### Step 2: Branch + Set Git Author (CRITICAL)
```bash
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```
Vercel Hobby previews silently 404 for commits authored by unverified emails. This is non-negotiable. See `docs/deployment/VERCEL_PREVIEW_GUIDE.md`.

### Step 3: Implement
- TypeScript strict, `'use client'` at the top of every component file.
- shadcn/ui primitives, `cn()` helper.
- Dark theme: Terminal Black page, Zinc panels, hairline Grid White borders at 10%.
- `tabular-nums` + `font-mono` on every numeric readout.
- Scene routes: 1920×1080, `overflow: hidden`, Terminal Black body, `bg-grid` on root.
- Overlay routes: 1920×1080, `overflow: hidden`, transparent body.
- No indigo/blue decorative accents. Channel colors only.
- Never use VLM for UI quality assessment — code analysis only.

### Step 4: Verify
```bash
bash scripts/verify.sh          # full suite
bash scripts/verify.sh --quick  # lint + tsc only
curl -sf -o /dev/null http://localhost:3000/scenes/<route>  # scene-route smoke
```

### Step 5: Document + Worklog
Append to `worklog.md` using the standard format. Update `docs/handoff/09-FEATURES.md` if a feature was added. Update `docs/handoff/12-KNOWN_ISSUES.md` if a gotcha was hit. Update `docs/handoff/CURRENT_STATE.md` if the project state changed.

### Step 6: Commit + Push
Commit format: `<type>(<scope>): <description> [Task ID: <id>]`.
Types: feat, fix, docs, refactor, chore, test, perf.
Scopes: `brand`, `scene`, `overlay`, `console`, `control`, `ticker`, `docs`, `infra`.

### Step 7: PR + Preview + Review Routing
- 🟠 `needs-human-review` — visible change. Don't merge; wait for "merge it".
- 🟢 `ai-verified` — no visible change. Verify, self-merge, inform the human.

### Step 8: After Merge
Pull main, delete the feature branch, sanity-check the production URL.

---

## 6. KNOWN GOTCHAS (Read `docs/handoff/12-KNOWN_ISSUES.md`)

- **FOUND-1:** Vercel preview 404s on bad-author commits. Fix: `git config user.email "rkw.kim22@gmail.com"`.
- **FOUND-2:** Never touch `legacy/v1-python-static` branch.
- **FOUND-3:** The fine-grained PAT in the git remote is intentional. Don't flag it.
- **SSR-1:** `useSyncExternalStore` requires `getServerSnapshot` (3rd arg) for SSR safety.
- **SSR-2:** Scene routes must not read `window`/`document` at module load time.
- **SSR-3:** The `--w21-active` CSS variable must be set on the server-rendered HTML.
- **OBS-1:** Browser Source refresh on scene activation causes ~500ms blank. Use "Cut" transition.
- **OBS-2:** OBS's CEF lags the latest Chrome. Test new CSS in OBS.
- **OBS-3:** Transparent overlays rely on OBS's default Browser Source CSS. Don't override it.
- **OBS-4:** Multiple Browser Sources stress low-end GPUs. Use "Shutdown when not visible".
- **BRAND-1:** Never modify `W21Mark.tsx`. (Rule 2.)
- **BRAND-2:** Never hard-code a channel color.
- **BRAND-3:** Never use indigo/blue as decorative accents.
- **BRAND-4:** Numbers must be monospaced.
- **BRAND-5:** The structural grid must be present on every scene.
- **PERF-1:** Lazy-load `recharts` to keep it out of the initial bundle.
- **PERF-2:** Throttle Socket.io `data:tick` state updates to 100ms.
- **GOTCHA-1:** `next/font/google` requires network at build time (use `next/font/local` for air-gapped).
- **GOTCHA-2:** `?XTransformPort=N` requires Caddy/Vercel rewrite rules.
- **GOTCHA-3:** `bun.lock` must be committed for `--frozen-lockfile` in CI.

---

## 7. THE ROADMAP (See `docs/handoff/09-FEATURES.md` + `docs/verticals/w21-trading/LAUNCH_ROADMAP.md`)

In priority order:
1. ✅ v2 foundation (git, legacy, W21 identity, docs) — FOUNDATION-1 + DOCS-1.
2. 🚧 First scene route — `/scenes/trading-live` (Prompt 07 spec). Built by code subagent (CODE-1).
3. 🚧 Control console v1 — `/` with SceneSwitcher + ChannelSelector + TickerEditor + Tally.
4. 📋 Market data layer — Deriv WebSocket + Twelve Data REST + budget-gating + simulated fallback.
5. 📋 Ticker overlay — `/overlays/ticker`.
6. 📋 Scene presets — Starting Soon, Live, BRB, Off-Air, curriculum-ladder presets.
7. 📋 24-hr programming grid auto-pilot (SchedulePanel).
8. 📋 OBS WebSocket bridge (optional console→OBS drive).
9. 📋 Scene Collection export to OBS JSON.
10. 📋 W21 Trading launch (Phase 0 — see `docs/verticals/w21-trading/LAUNCH_ROADMAP.md`).

---

## 8. THE W21 TRADING VERTICAL (Read `docs/verticals/w21-trading/`)

The launch channel. A 24/7 YouTube trading-education channel for Kenya/East Africa + global audience. Synthetic indices (Deriv: V10-V100, Step Index, Range Break, Boom & Crash) + forex (Twelve Data).

### The four vertical docs
- `README.md` — overview.
- `STRATEGIC_BRIEF.md` — executive vision, market gap, UVP, SWOT, competitive landscape (international broadcasting standard).
- `CONTENT_STRATEGY.md` — 24-hr programming grid (EAT/UTC+3), curriculum ladder (Step Index → V100), short-form funnel.
- `TECHNICAL_INFRASTRUCTURE.md` — VPS+FFmpeg streaming model, hybrid Mode 1/Mode 2, R2+Puter storage, n8n automation, hardware assessment.
- `LAUNCH_ROADMAP.md` — Phase 0-4 with timelines, milestones, risk matrix, monetization sequence.

### Why this matters for Smile Live Kit
The W21 Trading vertical drives the v2 feature priorities:
- `/scenes/trading-live` is the launch scene.
- The ticker's default symbol set is the Deriv synthetic indices.
- The 24-hr programming grid is the SchedulePanel's content.
- The curriculum-ladder presets map to the 5 modules.
- The hybrid streaming model (VPS+FFmpeg for fill, browser studio for live) is the deployment target.

### The 24-hour programming grid (EAT/UTC+3)
| Time | Block | Energy |
|------|-------|--------|
| 00:00–02:00 | Late Session Replay (V75 Live Trading) | HIGH |
| 02:00–06:00 | Beginner Curriculum (Step Index + V10) | LOW |
| 06:00–08:00 | Asian Session (V25 Live Trading) | MEDIUM |
| 08:00–12:00 | Intermediate Curriculum (V25→V50 + Boom&Crash) | LOW |
| 12:00–14:00 | London Session (V10/V25 Live Trading) | HIGH |
| 14:00–18:00 | Risk & Psychology (Risk Management) | LOW |
| 18:00–20:00 | Prime Time Signals (Community Signal Review) | HIGH |
| 20:00–00:00 | Advanced Curriculum (V75→V100 + Scaling) | MEDIUM |

### The curriculum ladder
1. Step Index (safest) — chart reading, support/resistance.
2. V10 (low vol) — first exposure to volatility mechanics.
3. V25 → V50 (moderate) — risk management, position sizing.
4. Range Break / Boom & Crash (patterns) — pattern recognition, breakout trading.
5. V75 → V100 (high vol) — advanced strategies, trading psychology.

---

## 9. KEY DECISIONS (Don't Re-Litigate)

1. Next.js App Router (not Pages, not Remix, not raw Express).
2. Next.js routes as scenes (not a custom rendering engine).
3. OBS as the encoder (not native WebRTC egress, not browser RTMP).
4. Socket.io for console→scene transport (not raw WebSocket, not SSE — though SSE is the Vercel-native fallback).
5. Native WebSocket for market data (not Socket.io — Deriv's socket is the source).
6. Prisma + SQLite dev, PostgreSQL prod.
7. Zustand for client state. TanStack Query for server state.
8. shadcn/ui for primitives. Tailwind 4 for styling.
9. W21 mark as code in `W21Mark.tsx` (not a static SVG asset, not a PNG).
10. Single Next.js app, no mini-services unless an ADR justifies one.
11. The 6 brand rules are non-negotiable.
12. The channel color map lives in `src/lib/w21/channels.ts` and nowhere else.
13. The fine-grained PAT in the git remote is intentional. Don't flag it.
14. The commit-author email must be `rkw.kim22@gmail.com` for Vercel previews.
15. The legacy/v1-python-static branch is frozen. Don't touch it.

---

## 10. THE TL;DR FOR THE NEXT AI

You are continuing Smile Live Kit. Read `AGENTS.md` + `docs/handoff/CURRENT_STATE.md` + this file + the last 3-5 worklog entries. Set the git author. Branch. Implement per the standards in `CONTRIBUTING.md`. Verify via `bash scripts/verify.sh`. Append to `worklog.md`. Commit + push. Open a PR. Pick the review type. Give the human the preview URL (for `needs-human-review`) or self-merge (for `ai-verified`).

The project's memory is in the docs + worklog. Treat them well. Leave the project better than you found it.

---

*This file is the briefing. The docs are the spec. The worklog is the history. The code is the artifact.*
