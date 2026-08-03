# 04 — TECH STACK

## Exact Dependencies + Why Each Was Chosen

This is the canonical list. Add a dependency only when the task at hand genuinely needs it; document the decision in an ADR. Avoid "drive-by" dependency creep.

---

## Runtime + Framework

| Dep | Version | Why |
|-----|---------|-----|
| `next` | `^16.1.1` | The framework. App Router + Turbopack. Routes are first-class — each scene/overlay is a route, served to OBS as a Browser Source. |
| `react` / `react-dom` | `^19.0.0` | Required by Next 16. React 19 Server Components + Actions are available; we use them sparingly (the scene/overlay model is client-rendered for live updates). |
| `typescript` | `^5` | Strict mode. The W21 channel map + scene model + transport events are typed end-to-end. |
| `bun` (runtime) | `1.3.x` (CI-pinned) | Package manager + dev runtime + bundler. Faster than npm/yarn/pnpm; matches CI. |

---

## Styling + UI

| Dep | Version | Why |
|-----|---------|-----|
| `tailwindcss` | `^4` | Atomic styling at 1920×1080. Tailwind 4 is faster + has the new Oxide engine. |
| `@tailwindcss/postcss` | `^4` | Tailwind 4 PostCSS plugin. |
| `tw-animate-css` | `^1.3.5` | Tailwind plugin for animation utilities (Framer Motion is used for complex animation; this handles the simple ones). |
| `tailwind-merge` | `^3.3.1` | Powers the `cn()` helper — resolves conflicting Tailwind classes. |
| `tailwindcss-animate` | `^1.0.7` | shadcn/ui dependency. |
| `clsx` | `^2.1.1` | Powers the `cn()` helper. |
| `class-variance-authority` | `^0.7.1` | shadcn/ui variants. |
| `lucide-react` | `^0.525.0` | Icons (1.5px stroke — matches the W21 fine-line aesthetic). |
| `cmdk` | `^1.1.1` | shadcn/ui Command primitive (for the future command palette). |

### shadcn/ui primitives (Radix-backed)
The `@radix-ui/react-*` packages are pulled in by `components.json` (the shadcn/ui config). Each primitive lives in `src/components/ui/<name>.tsx`. We use them — never hand-roll a dialog, dropdown, popover, tooltip, etc.

The full Radix list (already installed): accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip.

---

## State + Data

| Dep | Version | Why |
|-----|---------|-----|
| `@prisma/client` + `prisma` | `^6.11.1` | ORM. SQLite dev (file:./prisma/dev.db) / PostgreSQL prod. Schema-first; migrations via `prisma migrate`. |
| `zustand` | `^5.0.6` | Client state. Tiny, selector-friendly, SSR-safe with `useSyncExternalStore`. Used for: active channel, active scene, ticker text, tally, console layout. |
| `@tanstack/react-query` | `^5.82.0` | Server state. Cache + invalidation for the REST API endpoints (scene presets, schedule, market-data snapshots). |
| `@tanstack/react-table` | `^8.21.3` | Tables (future — for the schedule grid + the journal). |
| `zod` | `^4.0.2` | Schema validation at API route boundaries + env vars (`src/lib/env.ts`). |

---

## Realtime + Transport

| Dep | Version | Why |
|-----|---------|-----|
| `socket.io` + `socket.io-client` | latest | Console → scene transport. Reconnection, rooms, ack, fallback to long-polling. The server is attached to the Next.js app; the client is a singleton in `src/lib/transport/socketClient.ts`. |

> **Note on Socket.io + Vercel:** Vercel serverless functions have a 10s (Hobby) / 60s (Pro) max duration. A long-lived Socket.io connection may require a persistent server (Render, Railway, Fly.io) or the Vercel Edge runtime with WebSocket support. The decision is documented in [`13-GITHUB_MIGRATION_GUIDE.md`](13-GITHUB_MIGRATION_GUIDE.md) §"Socket.io on Vercel". The v2 foundation codes against the Socket.io API; the deployment target is swappable.

For live market data, we use **native WebSocket** (browser built-in) — Deriv's WebSocket is the source; we just bridge it. No Socket.io wrapper needed for the data path.

---

## Animation + Interaction

| Dep | Version | Why |
|-----|---------|-----|
| `framer-motion` | `^12.23.2` | Animations — tally flashes, alert in/out, lower-third reveals, scene transitions. |
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | `^6.3.1` / `^10.0.0` / `^3.2.2` | Drag-and-drop — the scene switcher reorder, the schedule grid drag, the channel selector reorder. |
| `react-resizable-panels` | `^3.0.3` | Resizable console panels. |
| `vaul` | `^1.1.2` | Drawer primitive (mobile console right rail). |
| `embla-carousel-react` | `^8.6.0` | Carousel primitive (future — preset picker). |

---

## Forms + Inputs

| Dep | Version | Why |
|-----|---------|-----|
| `react-hook-form` | `^7.60.0` | Forms (ticker editor, schedule editor, settings). |
| `@hookform/resolvers` | `^5.1.1` | Zod resolver for react-hook-form. |
| `input-otp` | `^1.4.2` | OTP input (future — admin auth). |

---

## Date + Time

| Dep | Version | Why |
|-----|---------|-----|
| `date-fns` | `^4.1.0` | Date utilities (the 24-hr programming grid is in EAT/UTC+3; `date-fns-tz` for timezone-aware arithmetic). |
| `react-day-picker` | `^9.8.0` | Date picker (future — schedule overrides). |

---

## Content + Markdown

| Dep | Version | Why |
|-----|---------|-----|
| `react-markdown` | `^10.1.0` | Render markdown in console tooltips + scene descriptions. |
| `@mdxeditor/editor` | `^3.39.1` | Rich text editor (future — show notes, scene descriptions). |
| `react-syntax-highlighter` | `^15.6.1` | Code highlighting (future — if the console ever shows logs). |

---

## Charts + Data Viz

| Dep | Version | Why |
|-----|---------|-----|
| `recharts` | `^2.15.4` | Lightweight charts (the price-history sparkline in the ticker + the equity curve in the stream-health panel). Note: lazy-load to keep it out of the initial bundle. |
| `sharp` | `^0.34.3` | Image processing (Next.js image optimization). |

---

## Auth + i18n + Themes

| Dep | Version | Why |
|-----|---------|-----|
| `next-auth` | `^4.24.11` | Auth (future — the console is currently open; auth is added when the kit is exposed publicly). |
| `next-intl` | `^4.3.4` | i18n (future — English-first, Kiswahili segments per the W21 Trading content strategy). |
| `next-themes` | `^0.4.6` | Theme switching (currently dark-only; `next-themes` is wired so a future light-mode-for-print can be added without rework). |

---

## Notifications + Utilities

| Dep | Version | Why |
|-----|---------|-----|
| `sonner` | `^2.0.6` | Toast notifications (the shadcn `sonner` primitive). |
| `uuid` | `^11.1.0` | ID generation (scene IDs, ticker IDs). |
| `@reactuses/core` | `^6.0.5` | Utility hooks (useInterval, useDebounce, useLocalStorage, etc.). |

---

## AI SDK (used sparingly)

| Dep | Version | Why |
|-----|---------|-----|
| `z-ai-web-dev-sdk` | `^0.0.18` | The Z.ai SDK — used in the sandbox build environment for any AI features (future — automated ticker summary, automated show notes). Not bundled into production unless explicitly needed. |

---

## Dev Dependencies

| Dep | Version | Why |
|-----|---------|-----|
| `eslint` | `^9` | Linter. |
| `eslint-config-next` | `^16.1.1` | Next.js ESLint rules. |
| `@types/react` / `@types/react-dom` | `^19` | React types. |
| `bun-types` | `^1.3.4` | Bun runtime types. |

---

## Install Commands

For a bare sandbox:
```bash
bash scripts/agent-bootstrap.sh
```

For a manual install:
```bash
bun install
bunx prisma generate
bun run db:push
cp .env.example .env   # edit with your keys
bun run dev
```

---

## Environment Variables

| Var | Required | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | Yes | Prisma DB connection. Default: `file:./prisma/dev.db` (dev). Prod: PostgreSQL URL. |
| `DERIV_API_TOKEN` | For live market data | Deriv API token (free tier — register at deriv.app). |
| `TWELVEDATA_API_KEY` | For forex data | Twelve Data API key (free tier — 800 credits/day). |
| `NEXT_PUBLIC_SOCKETIO_URL` | No (defaults to same origin) | Override for the Socket.io server (when running a separate mini-service). |
| `NEXT_PUBLIC_OBS_WEBSOCKET_URL` | No | OBS WebSocket URL (e.g., `ws://localhost:4455`) — when the console drives OBS. |
| `OBS_WEBSOCKET_PASSWORD` | No | OBS WebSocket password. |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | No (future) | YouTube Live API — chat ingest, stream health. |
| `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` | Auto-set by Vercel | Displayed in the console footer for version traceability. |

Secrets (`DERIV_API_TOKEN`, `TWELVEDATA_API_KEY`, `OBS_WEBSOCKET_PASSWORD`) are server-only — never prefixed with `NEXT_PUBLIC_`. The browser never sees them; the API routes proxy the requests.

---

## Version Drift

This stack was chosen at v2 foundation time. Library versions will drift. The rules:

1. **Minor + patch upgrades** — auto-applied by `bun update` in CI; lint + tsc must remain green.
2. **Major upgrades** — require an ADR (`docs/adr/`) and a separate PR. Do not bundle a major upgrade with a feature PR.
3. **Breaking changes** — even minor ones (e.g., a renamed export) — fix immediately, document in [`12-KNOWN_ISSUES.md`](12-KNOWN_ISSUES.md) under "Library Version Drift".

---

*Next: [`05-DESIGN_SYSTEM.md`](05-DESIGN_SYSTEM.md) for the dark theme, color tokens, typography, and scene/overlay conventions.*
