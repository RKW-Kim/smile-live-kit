# Contributing to Smile Live Kit

> **Read [`AGENTS.md`](AGENTS.md) first** — it has the AI handoff protocol and the 3 sacred rules (worklog non-rollbackable, W21 mark sacred, OBS as gold standard).

---

## Development Setup

```bash
git clone https://github.com/RKW-Kim/smile-live-kit.git
cd smile-live-kit

# Set the git author (REQUIRED for Vercel previews — see docs/deployment/VERCEL_PREVIEW_GUIDE.md)
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"

bun install
bunx prisma generate
bun run db:push      # creates prisma/dev.db
cp .env.example .env # edit with your keys (Deriv API token, Twelve Data key, etc.)

bun run dev          # open http://localhost:3000
```

For a fully bare sandbox (no bun, no deps, no DB):
```bash
bash scripts/agent-bootstrap.sh
```

For verification (lint + tsc + dev 200):
```bash
bash scripts/verify.sh          # full suite
bash scripts/verify.sh --quick  # lint + tsc only
```

---

## Stack

| Layer | Choice | Why |
|------|--------|-----|
| Framework | **Next.js 16** (App Router, Turbopack) | Routes are first-class — each scene/overlay is a route, served to OBS as a Browser Source. |
| Language | **TypeScript 5** (strict) | Type safety across the W21 channel map, scene model, and transport payloads. |
| Styling | **Tailwind CSS 4** | Atomic styling at 1920×1080 — no runtime CSS-in-JS cost on scene routes. |
| UI primitives | **shadcn/ui** (New York style) + Lucide icons | Composable, accessible, theme-able to Terminal Black. |
| Data layer | **Prisma ORM** (SQLite dev / PostgreSQL prod) | Schema-first persistence for scene presets, schedule, journal, settings. |
| Client state | **Zustand** | Tiny, selector-friendly, SSR-safe (with `useSyncExternalStore`). |
| Server state | **TanStack Query** | Cache + invalidation for market data REST endpoints. |
| Realtime | **Socket.io** (server + client) | Console → scene transport, with reconnection + rooms. |
| Animation | **Framer Motion** | Tally flashes, alert overlays, lower-thirds in/out. |
| Fonts | **Geist Sans** + **JetBrains Mono** | Mono for every numeric readout (Rule 5); sans for body. |
| Package manager | **Bun** | Fast install + runtime; matches CI. |

---

## Code Standards

### TypeScript
- **`strict: true`** — no `any` without a justification comment (`// any: <reason>`).
- **`'use client'`** at the top of every component file. Server-only files (API routes, lib) omit it.
- **Branded types** where an ID is structurally a string but semantically a domain ID (e.g., `ChannelKey`, `SceneId`, `OverlayId`). Keep these in `src/lib/w21/channels.ts` and `src/lib/types.ts`.
- **`useSyncExternalStore`** for any Zustand store that reads during SSR — always pass `getServerSnapshot` (3rd arg) to prevent hydration mismatches.
- **No `useState` inside `useEffect`** — use `useRef` or `useMemo`. If unavoidable, add an eslint-disable with a comment.

### Tailwind + shadcn/ui
- Use existing shadcn/ui primitives — don't hand-roll buttons, dialogs, dropdowns, tooltips.
- **`cn()` helper** from `@/lib/utils` for conditional classes.
- **NO indigo or blue decorative accents.** Indigo `#6366F1` and Blue `#3B82F6` are reserved as **channel colors** (Innovation and Education respectively). They appear ONLY when rendering those channels' identity. Generic UI accents use the channel color of the active context, or Grid White / Zinc for neutral surfaces.
- **Dark theme only** — page background `#0A0A0A` (Terminal Black), panels `#27272A` (Zinc), borders `rgba(245,245,245,0.10)`. No light mode.
- **`tabular-nums` on every numeric readout** — prices, percentages, timestamps, durations, follower counts, viewer counts. Use `font-mono tabular-nums` together.
- **Responsive at 1920×1080 first** — every scene/overlay is designed for OBS Browser Source (1920×1080). The control console at `/` is responsive down to tablet (768px minimum); mobile is view-only (future).
- **`overflow: hidden`** on every scene/overlay root — OBS Browser Source captures the full 1920×1080 viewport. Any scroll or overflow leaks into the stream.

### Scene / overlay route conventions
Every route under `src/app/scenes/*` and `src/app/overlays/*`:
1. Page root is a `<div>` with `width: 1920px; height: 1080px; position: relative; overflow: hidden;` (use a shared `SceneFrame` or `OverlayFrame` wrapper).
2. The `<body>` is transparent (OBS composites the page over the OBS canvas) — set in `layout.tsx` for scene/overlay route groups, or via a per-route `<style>` tag.
3. The W21 mark is rendered via `<W21Mark channel="..." size={...} />` — never an `<img>`, never a hand-drawn approximation.
4. The channel color is sourced from `getChannel(channel).color` — never hard-coded.
5. Numeric readouts use `font-mono tabular-nums`.
6. The faint structural grid (Rule 6) is present via a `bg-grid` utility class or inline background-image.

### Control console conventions
The console at `src/app/page.tsx` (and its child panels):
1. Dark theme — Terminal Black page, Zinc panels, hairline Grid White borders at ~10% opacity.
2. Channel selector switches the active channel color across the entire console (drives the accent surfaces).
3. Big, finger-friendly hit targets (minimum 44×44px) — the console is "grandma-operable."
4. Scene switcher: a grid of scene cards. Click → preview. Double-click → program (OBS-style cut). Drag → reorder.
5. Ticker editor: a text field + a "Send to scene" button → emits a Socket.io event the scene route consumes.
6. Tally indicators: red dot = program (live), green dot = preview, amber dot = cued.

### API routes
- **Use API routes (Route Handlers in `src/app/api/*`), NOT Server Actions.** Hard rule. Server Actions couple the client to the server bundle and break the OBS Browser Source model (scenes load via GET, not POST form submits).
- All requests use **relative paths** — never `fetch('http://localhost:3000/...')`.
- Cross-service (when a mini-service exists): `?XTransformPort=3001` query param. See `AGENTS.md` §"Gateway & Cross-Service Rules."
- Validate every input with **Zod** at the route boundary. Return `400` on invalid input, `401` on unauthenticated, `404` on not-found, `500` only for genuine server faults.
- Never expose secrets to the client. `NEXT_PUBLIC_*` env vars are inlined into the bundle — only put non-secret values there.

### W21 brand compliance
- The mark is sacred (`AGENTS.md` Rule 2). Read [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md) before touching anything in `src/components/w21/`.
- The channel color map lives in `src/lib/w21/channels.ts` and **nowhere else**. Adding a channel = adding an entry there + an entry in `docs/brand/IDENTITY_SYSTEM.md`.
- Gold #F5A623 is the parent color. It appears only on parent-brand contexts (the smile.co.ke master mark, the W21 ecosystem lockup), never on a channel scene.

---

## Commit Format

```
<type>(<scope>): <description> [Task ID: <id>]
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`
Scopes: `brand`, `scene`, `overlay`, `console`, `control`, `ticker`, `docs`, `infra`

Examples:
```
feat(scene): add /scenes/trading-live per Prompt 07 spec [Task ID: SCENE-LIVE-1]
fix(ticker): Deriv websocket reconnect after token expiry [Task ID: FIX-TICKER-3]
docs(handoff): update CURRENT_STATE for v2 foundation [Task ID: DOCS-1]
refactor(console): extract SceneSwitcher into its own panel [Task ID: REFACT-2]
chore(infra): pin bun to 1.3.x in CI [Task ID: CHORE-BUN-1]
```

---

## Verification

```bash
bun run lint              # ESLint must pass (0 errors)
bunx tsc --noEmit         # TypeScript must pass (0 errors)
bun run dev               # Dev server must return 200 on / AND on every /scenes/* route

# Scene-route smoke test (programmatic):
curl -sf -o /dev/null http://localhost:3000/                            && echo "console OK"
curl -sf -o /dev/null http://localhost:3000/scenes/trading-live        && echo "scene OK"

# Full local suite:
bash scripts/verify.sh
```

---

## PR Process

1. Branch from `develop` (or `main`): `feat/<your-feature>`.
2. Implement following the standards above.
3. Verify: `bash scripts/verify.sh` (lint + tsc + dev 200).
4. Append to `worklog.md`.
5. Commit + push: `git push -u origin feat/<your-feature>`.
6. Open PR on GitHub. Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`). Link the Task ID.
7. Pick exactly ONE review type:
   - 🟠 `needs-human-review` — visible change (a scene, an overlay, a console layout, a color, an animation). Don't merge; wait for the human.
   - 🟢 `ai-verified` — no visible change (types, lint, docs, config, refactor with no UI effect). Verify, self-merge (squash), inform the human.
8. CI must pass (lint + typecheck + build + dev-server). Merge after review.

See [`docs/development/PR_REVIEW_PROCESS.md`](docs/development/PR_REVIEW_PROCESS.md) for the full review-routing system.

---

## Mini-Services Pattern

A Smile Live Kit mini-service is an **independent bun project** (own `package.json`, own port, own process) that handles a subsystem the main Next.js app should not handle directly — e.g., a long-lived Deriv WebSocket relay, an OBS WebSocket bridge, an n8n-style scheduler.

Rules:
- A mini-service lives in `mini-services/<name>/`.
- It never imports from `src/` (the main app's source). It exposes an HTTP / Socket.io interface; the main app talks to it via `?XTransformPort=<port>`.
- It has its own `package.json`, `tsconfig.json`, and `bun.lock`. Do not share deps with the main app.
- It runs on its own port (3001, 3002, …). The Caddyfile (or Vercel rewrites) routes `/<path>?XTransformPort=<port>` → `http://localhost:<port>/<path>`.
- Document the decision to introduce a mini-service in `docs/adr/`. The default posture is "no mini-services" — only add one when a subsystem genuinely needs its own process (long-lived socket, persistent state, different runtime).

---

## Getting Help

- Stuck on a bug? Read [`docs/handoff/12-KNOWN_ISSUES.md`](docs/handoff/12-KNOWN_ISSUES.md).
- Don't understand a subsystem? Read the relevant doc in [`docs/handoff/`](docs/handoff/).
- Don't know what's next? Read [`docs/handoff/CURRENT_STATE.md`](docs/handoff/CURRENT_STATE.md).
- Need history? Read [`worklog.md`](worklog.md) bottom-up.
- Brand question? Read [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md).
- W21 Trading vertical question? Read [`docs/verticals/w21-trading/`](docs/verticals/w21-trading/).
- Deployment / preview issue? Read [`docs/deployment/VERCEL_PREVIEW_GUIDE.md`](docs/deployment/VERCEL_PREVIEW_GUIDE.md) + [`docs/deployment/SAFEGUARDS.md`](docs/deployment/SAFEGUARDS.md).
- Architecture decision history? Read [`docs/adr/`](docs/adr/).

---

*This file is the developer's manual. The handoff contract is in [`AGENTS.md`](AGENTS.md).*
