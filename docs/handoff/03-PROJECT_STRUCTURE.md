# 03 — PROJECT STRUCTURE

## Full File Tree

Every directory in Smile Live Kit, what it does, and what lives in it. This is the canonical map — when in doubt about where a file goes, check here.

```
smile-live-kit/
├── AGENTS.md                        # The handoff contract (3 sacred rules, workflow, gateway rules). Read first.
├── CONTRIBUTING.md                  # Stack, code standards, PR process, mini-services pattern.
├── README.md                        # (Created later — repo overview, quickstart, links to docs.)
├── worklog.md                       # The non-rollbackable worklog. Append before AND after every session.
├── .gitignore                       # node_modules, .next, .env, db/*.db, upload/, tool-results/, etc.
├── .env.example                     # Template for env vars (Deriv token, Twelve Data key, etc.). Real .env is gitignored.
├── .github/
│   ├── workflows/
│   │   └── ci.yml                   # CI: lint + typecheck + build + dev-server 200. Blocking.
│   ├── PULL_REQUEST_TEMPLATE.md     # PR template with the two-label review-routing system.
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.yml           # Bug report (severity + area dropdowns).
│       └── feature_request.yml      # Feature request (OBS parity dropdown).
├── scripts/
│   ├── verify.sh                    # Local verification suite (lint + tsc + dev 200). --quick for lint+tsc only.
│   └── agent-bootstrap.sh           # Bare-sandbox bootstrap: bun install + git identity + prisma + quick verify.
├── docs/                            # ← The documentation system (you are here).
│   ├── README.md                    # Docs index + reading order.
│   ├── RESEARCH_INDEX.md            # Catalog of all research + how it informs features.
│   ├── handoff/                     # 17-file handoff series (00-16) + AI_BRIEFING + CURRENT_STATE.
│   ├── brand/
│   │   └── IDENTITY_SYSTEM.md       # The W21 brand bible — read end-to-end before touching src/components/w21/.
│   ├── deployment/
│   │   ├── SAFEGUARDS.md            # Branch protection, PR approval, token security.
│   │   └── VERCEL_PREVIEW_GUIDE.md  # The commit-author-email rule + how to read the real preview URL.
│   ├── development/
│   │   ├── BRANCHING.md             # Branch model (main/develop/feat/fix/docs/hotfix).
│   │   ├── PR_REVIEW_PROCESS.md     # needs-human-review vs ai-verified routing.
│   │   └── WORKFLOW_GUIDE.md        # The day-to-day dev loop.
│   ├── verticals/
│   │   └── w21-trading/             # The launch channel.
│   │       ├── README.md
│   │       ├── STRATEGIC_BRIEF.md
│   │       ├── CONTENT_STRATEGY.md
│   │       ├── TECHNICAL_INFRASTRUCTURE.md
│   │       └── LAUNCH_ROADMAP.md
│   ├── adr/                         # Architecture Decision Records.
│   │   └── 0001-nextjs-as-scene-renderer.md
│   └── research/                    # Future research docs (RESEARCH-*.md). Currently empty — populate as research is done.
├── prisma/
│   ├── schema.prisma                # The Prisma schema (models for ScenePreset, Schedule, Journal, Setting, etc.).
│   ├── dev.db                       # SQLite dev database (gitignored — regenerated from schema.prisma).
│   ├── test.db                      # SQLite test database (gitignored — used by CI).
│   └── seed.ts                      # Seed data (default scene presets, default channel config).
├── public/
│   ├── logo.svg                     # The smile.co.ke / Smile Live Kit favicon.
│   ├── robots.txt
│   └── w21/                         # W21 static assets (brand pack, fonts, OG images). Created later.
├── src/
│   ├── app/                         # Next.js App Router.
│   │   ├── layout.tsx               # Root layout — dark theme, Geist Sans + JetBrains Mono fonts, Toaster.
│   │   ├── page.tsx                 # The control console at `/`.
│   │   ├── globals.css              # Tailwind base + the `bg-grid` utility + W21 CSS variables.
│   │   ├── scenes/                  # Scene routes — each renders at 1920×1080.
│   │   │   ├── trading-live/
│   │   │   │   └── page.tsx         # The W21 Trading live trade scene (Prompt 07 spec).
│   │   │   ├── starting-soon/
│   │   │   │   └── page.tsx         # Pre-roll scene.
│   │   │   ├── be-right-back/
│   │   │   │   └── page.tsx         # Interstitial.
│   │   │   ├── off-air/
│   │   │   │   └── page.tsx         # 24/7 fill / "Stream is off" scene.
│   │   │   ├── lesson-replay/       # Future — wraps a VOD in the W21 frame.
│   │   │   └── ...                  # One folder per scene route.
│   │   ├── overlays/                # Overlay routes — transparent body, 1920×1080.
│   │   │   ├── ticker/
│   │   │   │   └── page.tsx         # Live market-data ticker.
│   │   │   ├── lower-third/
│   │   │   │   └── page.tsx         # Animated lower-third (guest name, topic, breaking news).
│   │   │   ├── alert/               # Future — follow/sub/donation/raid alerts.
│   │   │   └── ...
│   │   ├── api/                     # Route Handlers (REST endpoints).
│   │   │   ├── route.ts             # Root health check.
│   │   │   ├── ticker/route.ts      # Current ticker snapshot.
│   │   │   ├── scene/current/route.ts  # Active scene + channel + tally (one-shot).
│   │   │   ├── scene/presets/route.ts  # List/save/load scene presets.
│   │   │   ├── data/deriv/route.ts  # Deriv symbol snapshot (REST shim over the WS bridge).
│   │   │   ├── data/twelvedata/route.ts  # Twelve Data symbol snapshot (cached, budget-aware).
│   │   │   ├── schedule/route.ts    # 24-hr programming grid.
│   │   │   └── obs-websocket/route.ts   # OBS WebSocket bridge (when configured).
│   │   └── (console)/               # Optional route group for console-only layouts (e.g., a tabbed console).
│   ├── components/
│   │   ├── w21/                     # W21 brand components (sacred + adjacent).
│   │   │   ├── W21Mark.tsx          # The universal mark (Rule 2 — SACRED, do not modify).
│   │   │   ├── W21Lockup.tsx        # Mark + pipe + channel name. Composes W21Mark.
│   │   │   ├── W21Watermark.tsx     # Future — ghost mark for scene corners.
│   │   │   └── W21Favicon.tsx       # Future — dynamic per-channel favicon.
│   │   ├── scene/                   # Reusable scene/overlay building blocks.
│   │   │   ├── SceneFrame.tsx       # 1920×1080 wrapper with overflow:hidden + bg-grid.
│   │   │   ├── OverlayFrame.tsx     # Transparent-body wrapper for overlays.
│   │   │   ├── Ticker.tsx           # The ticker component (subscribes to live data).
│   │   │   ├── LowerThird.tsx       # Animated lower-third.
│   │   │   ├── Tally.tsx            # Tally indicator (red/green/amber).
│   │   │   ├── PriceReadout.tsx     # Monospaced price + delta display.
│   │   │   ├── Clock.tsx            # Monospaced UTC/EAT clock.
│   │   │   └── ...
│   │   ├── console/                 # Control-console panels.
│   │   │   ├── ConsoleShell.tsx     # Layout: header + main + right rail.
│   │   │   ├── SceneSwitcherPanel.tsx
│   │   │   ├── ChannelSelector.tsx
│   │   │   ├── TickerEditor.tsx
│   │   │   ├── TallyIndicator.tsx
│   │   │   ├── StreamHealthPanel.tsx
│   │   │   └── SchedulePanel.tsx
│   │   ├── transport/
│   │   │   ├── TransportProvider.tsx # Socket.io client context.
│   │   │   └── TransportReconnectBanner.tsx  # Banner when the socket drops.
│   │   └── ui/                      # shadcn/ui primitives (button, dialog, dropdown, etc.). Auto-generated.
│   ├── lib/
│   │   ├── utils.ts                 # cn() helper (clsx + tailwind-merge).
│   │   ├── db.ts                    # Prisma client singleton.
│   │   ├── env.ts                   # Typed env-var access (zod-validated).
│   │   ├── types.ts                 # Shared types (SceneId, OverlayId, TickerPayload, etc.).
│   │   ├── w21/
│   │   │   └── channels.ts          # The channel color map + system colors. Single source of truth.
│   │   ├── data/
│   │   │   ├── deriv.ts             # Deriv WebSocket client.
│   │   │   ├── twelvedata.ts        # Twelve Data REST client (cached, budget-aware).
│   │   │   └── budgetGate.ts        # Daily-budget tracker + simulated fallback.
│   │   ├── transport/
│   │   │   ├── socketServer.ts      # Socket.io server bootstrap.
│   │   │   ├── socketClient.ts      # Socket.io client singleton.
│   │   │   └── events.ts            # Typed event map.
│   │   └── scene/
│   │       ├── presets.ts           # Scene preset definitions (Starting Soon, Live, Be Right Back, etc.).
│   │       └── schedule.ts          # 24-hr programming grid utilities.
│   ├── hooks/
│   │   ├── use-toast.ts             # shadcn toast hook.
│   │   ├── use-mobile.ts            # Responsive breakpoint hook.
│   │   ├── use-channel.ts           # Active channel state (Zustand-backed).
│   │   ├── use-ticker.ts            # Ticker text state + Socket.io emit.
│   │   └── use-market-data.ts       # Live market-data subscription hook.
│   └── middleware.ts                # (Future) Auth + routing middleware.
├── mini-services/                   # Empty by default. Mini-services go here (see 02-ARCHITECTURE.md).
├── tests/                           # (Future) Playwright smoke tests + scene-route tests.
├── e2e/                             # (Future) Playwright e2e specs.
├── eslint.config.mjs                # ESLint config (Next.js defaults + strict + W21 lint conventions).
├── tsconfig.json                    # TypeScript config (strict, paths: { @/*: ["./src/*"] }).
├── tailwind.config.ts               # Tailwind config (the W21 color tokens + the `bg-grid` utility).
├── postcss.config.mjs               # PostCSS config (Tailwind 4 + autoprefixer).
├── components.json                  # shadcn/ui config (New York style, lucide icons, @/components/ui path).
├── next.config.ts                   # Next.js 16 config (Turbopack, output: 'standalone' for prod).
├── Caddyfile                        # Reverse-proxy config (dev: routes ?XTransformPort=N to localhost:N).
├── bun.lock                         # Bun lockfile (committed for --frozen-lockfile in CI).
└── package.json                     # Dependencies + scripts (dev, build, lint, db:push, db:generate).
```

---

## Where Things Go — The Rules

1. **A new scene route** → `src/app/scenes/<scene-name>/page.tsx`. Use `<SceneFrame channel="...">` as the root.
2. **A new overlay route** → `src/app/overlays/<overlay-name>/page.tsx`. Use `<OverlayFrame>` as the root.
3. **A new API endpoint** → `src/app/api/<resource>/route.ts`. Validate input with Zod. Use relative paths.
4. **A new W21 brand component** → `src/components/w21/<Name>.tsx`. **NEVER modify `W21Mark.tsx`.**
5. **A new reusable scene widget** (ticker, lower-third, clock, price readout) → `src/components/scene/<Name>.tsx`.
6. **A new console panel** → `src/components/console/<Name>.tsx`.
7. **A new channel** → add an entry to `src/lib/w21/channels.ts` AND to `docs/brand/IDENTITY_SYSTEM.md` AND to `docs/handoff/09-FEATURES.md` (if relevant). Do not duplicate the color anywhere else.
8. **A new shared type** → `src/lib/types.ts`.
9. **A new env var** → add to `.env.example`, validate in `src/lib/env.ts`, document in `docs/handoff/04-TECH_STACK.md` (if it's a dependency) or `docs/handoff/13-GITHUB_MIGRATION_GUIDE.md` (if it's a deployment secret).
10. **A new mini-service** → `mini-services/<name>/` with its own `package.json`. Document the decision in `docs/adr/`.
11. **A new doc** → check the docs map in [`00-MASTER-HANDOFF-INDEX.md`](00-MASTER-HANDOFF-INDEX.md) first; if it fits an existing slot, extend that doc; otherwise add a new doc and update the index.
12. **A new ADR** → `docs/adr/<NNNN>-<slug>.md` (next available number).

---

## Legacy Branch — `legacy/v1-python-static`

The v1 Python+static-HTML kit lives on the `legacy/v1-python-static` branch. It contains:

- `server/app.py` — Flask bridge, port 8787.
- `core/01-starting-soon.html`, `03-live.html`, etc. — static HTML scenes.
- `obs/Smile-Trading-Kit.json` — OBS scene collection.
- `brands/` — v1 brand assets.

**Do NOT touch the legacy branch unless explicitly asked.** When porting a v1 concept to v2, copy the *idea* (the data shape, the scene layout, the OBS scene collection structure), not the code. Cite the v1 file in the worklog entry when porting.

---

*Next: [`04-TECH_STACK.md`](04-TECH_STACK.md) for the exact dependencies + install commands.*
