# 02 — ARCHITECTURE

## The 5 Core Systems

This document describes the architectural systems that make Smile Live Kit work. Each is a named, documented subsystem with a clear boundary. They are settled — do not re-architect them without an ADR.

---

## 1. The Scene Router — Next.js App Router as a Scene/Overlay Renderer

### Problem
OBS Studio consumes a Browser Source — a URL pointing at a full-screen 1920×1080 web page. The kit must produce, manage, and version a growing library of scene and overlay routes, each rendering identically in OBS, in a browser preview, and on a Vercel preview deployment.

### Solution
The Next.js App Router is the scene renderer. Every route under `src/app/scenes/*` and `src/app/overlays/*` is a self-contained 1920×1080 page:

- `src/app/scenes/trading-live/page.tsx` → `/scenes/trading-live` → the W21 Trading live trade scene.
- `src/app/scenes/starting-soon/page.tsx` → `/scenes/starting-soon` → the "Starting Soon" pre-roll.
- `src/app/overlays/ticker/page.tsx` → `/overlays/ticker` → the live market-data ticker (transparent body).
- `src/app/overlays/lower-third/page.tsx` → `/overlays/lower-third` → animated lower-third (transparent body).

Each scene/overlay route:
1. Renders a `<SceneFrame channel="..." />` (or `<OverlayFrame />`) wrapper that fixes the viewport at 1920×1080, sets `overflow: hidden`, and (for overlays) makes the body transparent.
2. Composes `W21Mark`, `W21Lockup`, ticker widgets, lower-thirds, etc. from `src/components/w21/` and `src/components/scene/`.
3. Subscribes to the Socket.io transport (or reads a one-shot API on mount, with Socket.io for updates) for live state — the active channel, the ticker text, the tally, the schedule.

### Key files (the v2 foundation)
- `src/app/layout.tsx` — root layout, dark theme, fonts (Geist Sans + JetBrains Mono).
- `src/app/page.tsx` — the control console at `/` (see System 4).
- `src/app/scenes/<name>/page.tsx` — one file per scene route.
- `src/app/overlays/<name>/page.tsx` — one file per overlay route.
- `src/app/api/*` — Route Handlers for one-shot state, market data, scene presets, settings.

### The SceneFrame / OverlayFrame contract
Both wrappers enforce:
- `width: 1920px; height: 1080px;` on the root div.
- `position: relative; overflow: hidden;` so absolutely-positioned children (the W21 mark, the ticker, the lower-thirds) clip to the frame.
- A `bg-grid` utility class (or inline `background-image`) that paints the faint structural grid (Rule 6).
- For overlays: `<html>` and `<body>` set to `background: transparent` (via a per-route layout or a `<style>` tag), so OBS composites the overlay over the OBS canvas.

### URL → OBS wiring
1. OBS operator adds a Browser Source at 1920×1080.
2. URL: `https://smile-live-kit.vercel.app/scenes/trading-live`.
3. OBS renders the page in Chromium Embedded at 60fps.
4. The page subscribes to Socket.io; the console pushes state; the scene updates in real time.
5. For overlays (transparent), OBS "Custom CSS" remains the default (`body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }`).

See [`06-SCENE_MODEL.md`](06-SCENE_MODEL.md) for the full scene-model spec and [`07-OBS_INTEGRATION.md`](07-OBS_INTEGRATION.md) for the OBS wiring details.

---

## 2. The W21 Identity System — Brand as Code

### Problem
The W21 brand spans 12 channels + the parent. The mark must be identical everywhere; only the color changes. A hand-drawn mark in each scene would drift. A `public/logo.svg` would not respond to channel switches in real time.

### Solution
The brand is code, in one canonical place:

- `src/lib/w21/channels.ts` — the channel color map. **The single source of truth.** Adding a channel = adding an entry here + an entry in [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md).
- `src/components/w21/W21Mark.tsx` — the universal mark (Rule 2 — sacred). Renders the rounded square + "W21" + the status dot. Takes a `channel: ChannelKey` prop, derives the color, applies the dot + glow. Scales from 24px (ticker chips) to 96px+ (watermarks) without distortion.
- `src/components/w21/W21Lockup.tsx` — the lockup (mark + pipe + channel name). The channel name is always Grid White (Rule 3). The pipe + dot take the channel color (Rule 2).

### The system colors
```ts
export const w21System = {
  terminal: "#0A0A0A",   // page background, mark fill
  gridWhite: "#F5F5F5",  // text, borders, mark border
  zinc: "#27272A",       // panels, dividers
  alert: "#FF006E",      // alerts, breaking news, error states
  bull: "#22C55E",       // market up
  bear: "#DC2626",       // market down
} as const;
```

### The 6 brand rules (encoded as TypeScript + Tailwind conventions)
1. The mark is sacred — `W21Mark.tsx` is read-only. (Rule 2 in `AGENTS.md`.)
2. Color is the differentiator — the only prop-driven variable in `W21Mark`.
3. Channel name stays white — `W21Lockup` hard-codes `color: #F5F5F5` on the name.
4. Gold is the parent — `channels.parent.color = "#F5A623"`. Gold appears only on parent-brand surfaces.
5. Numbers are monospaced — `font-mono tabular-nums` on every numeric readout (enforced by lint convention).
6. The grid never sleeps — `bg-grid` utility class on every scene/overlay root.

See [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md) for the complete brand spec.

---

## 3. The Data Layer — Market Data via WebSocket + REST, Budget-Gated

### Problem
The W21 Trading ticker needs live synthetic-indices prices (Deriv) and forex prices (Twelve Data). Both APIs have free tiers with daily call limits. A 24/7 stream would burn through them in hours if polled naively.

### Solution
A budget-gating data layer:

- **Deriv WebSocket** — synthetic indices (V10, V25, V50, V75, V100, Step Index, Range Break, Boom & Crash). Push-based (no polling). One open socket, subscribe to the symbols the active scene needs. The 24/7 stream is well within Deriv's free API limits because WebSocket ticks are push, not pull.
- **Twelve Data REST** — forex (EUR/USD, GBP/USD, USD/JPY, USD/KES, etc.). Free tier: 800 API credits/day, 8 credits/min. The data layer caches each symbol's last price for 15-30 seconds and refuses to re-fetch within the cache window. When the daily budget is exhausted, it falls back to a simulated random-walk stream (clearly labeled "SIM" in the UI) so the ticker never goes dark.
- **Prisma** — persistence for scene presets, schedule, journal, settings. SQLite in dev, PostgreSQL in prod (Vercel Postgres, Neon, or Supabase).

### Key files (planned)
- `src/lib/data/deriv.ts` — Deriv WebSocket client (subscribe, unsubscribe, reconnect).
- `src/lib/data/twelvedata.ts` — Twelve Data REST client (cached, budget-aware).
- `src/lib/data/budgetGate.ts` — daily-budget tracker + simulated fallback.
- `src/app/api/ticker/route.ts` — REST endpoint that returns the current ticker snapshot (for the console + for one-shot scene hydration).
- `src/components/scene/Ticker.tsx` — the ticker component (subscribes to Socket.io for live ticks; falls back to REST on mount).

See [`10-DATA_FEEDS.md`](10-DATA_FEEDS.md) for the full data-layer spec.

---

## 4. The Control Console — Grandma-Operable Panel at `/`

### Problem
The OBS operator has a complex tool (OBS itself). The producer — who may be the on-air talent's mother — needs a simple tool to switch scenes, edit the ticker, pick the channel, and monitor the stream. Two different audiences, two different surfaces.

### Solution
The control console at `/` is the producer's surface. It is a single-page Next.js route composed of panels:

- **SceneSwitcherPanel** — a grid of scene cards. Click → preview. Double-click → program (OBS-style cut). Drag → reorder. Each card shows the scene's name, a thumbnail (live `<iframe>` preview or a static poster), and a tally dot (red = program, green = preview, amber = cued).
- **ChannelSelector** — 12 channel buttons + the parent. Click → switches the active channel across the entire console AND across every connected scene route (via Socket.io). The button shows the W21 mark + the channel name; the active one has a ring in the channel color.
- **TickerEditor** — a text field + a "Send to scene" button + a list of recent ticker messages. Live market-data symbols (e.g., `V75`, `EUR/USD`) are auto-injected at the cursor or appended to the ticker.
- **TallyIndicator** — a big red/green/amber light mirroring the OBS Studio Mode state.
- **StreamHealthPanel** — uptime, dropped frames, bitrate (via OBS WebSocket, when configured; otherwise via YouTube Live API).
- **SchedulePanel** — the 24-hr programming grid (see [`../verticals/w21-trading/CONTENT_STRATEGY.md`](../verticals/w21-trading/CONTENT_STRATEGY.md)). The operator can override the auto-pilot or let it run.

### Key files (planned)
- `src/app/page.tsx` — the console route.
- `src/components/console/ConsoleShell.tsx` — the layout (header with W21 lockup + channel selector; main with scene switcher + ticker editor; right rail with tally + stream health + schedule).
- `src/components/console/SceneSwitcherPanel.tsx`
- `src/components/console/ChannelSelector.tsx`
- `src/components/console/TickerEditor.tsx`
- `src/components/console/TallyIndicator.tsx`
- `src/components/console/StreamHealthPanel.tsx`
- `src/components/console/SchedulePanel.tsx`

### Grandma-operable principles
- Big hit targets (minimum 44×44px).
- No jargon — "Switch to this scene" not "Cut to program".
- Clear state — the active scene, the active channel, the tally state are always visible at a glance.
- Forgiving — every action has an undo. The console never "loses" a state; it can always revert.
- Phone-friendly — the console's right rail collapses to a tab on narrow viewports.

See [`08-CONTROL_CONSOLE.md`](08-CONTROL_CONSOLE.md) for the full console spec.

---

## 5. The Transport — Socket.io for Console→Scene State

### Problem
The console pushes state (active scene, ticker text, channel color, tally, schedule) to N scene routes simultaneously. HTTP polling would be latency-prone and noisy. Raw WebSocket lacks reconnection + room semantics.

### Solution
Socket.io (server + client) on the same Next.js app:

- The Next.js app hosts a Socket.io server at `/api/socketio` (or via a custom server, depending on Vercel compatibility — see `docs/handoff/13-GITHUB_MIGRATION_GUIDE.md` §"Socket.io on Vercel").
- Each scene route opens a Socket.io client on mount, joins a room keyed by the channel + scene name (e.g., `trading-live`), and listens for state events.
- The console emits events: `scene:switch`, `ticker:update`, `channel:change`, `tally:set`, `schedule:override`.
- The server fans out the events to all rooms that care.

### Essence separation
Following the ST 2110 philosophy (essence = an independent stream of a single essence type — video, audio, control, telemetry), Smile Live Kit separates its Socket.io events by essence:

| Channel (Socket.io event namespace) | Purpose | Reliability |
|-------------------------------------|---------|-------------|
| `state` | Active scene, channel color, tally, schedule | At-least-once (critical state must arrive) |
| `ticker` | Ticker text updates | At-most-once (latest wins; old updates are dropped) |
| `data` | Live market-data ticks | At-most-once (latest price wins) |
| `presence` | Operator presence ("who is online") | Best-effort |
| `chat` (future) | YouTube/Twitch chat ingest for alerts | Best-effort |

A flood of `data` events can never block a `state` event — they are separate Socket.io channels (or separate event names with separate handler queues).

### Key files (planned)
- `src/lib/transport/socketServer.ts` — the Socket.io server bootstrap (attach to Next.js custom server or to a Vercel-compatible wrapper).
- `src/lib/transport/socketClient.ts` — the Socket.io client (singleton, auto-reconnect).
- `src/lib/transport/events.ts` — the typed event map (`state`, `ticker`, `data`, `presence`, `chat`).
- `src/components/transport/TransportProvider.tsx` — React context wrapping the socket client.

See [`11-TRANSPORT_REALTIME.md`](11-TRANSPORT_REALTIME.md) for the full transport spec.

---

## Mini-Services — When to Introduce Them

The default posture is **NO mini-services** — Smile Live Kit is a single Next.js app. Mini-services (independent bun projects on their own ports) are added ONLY when a subsystem genuinely needs its own process:

- A long-lived Deriv WebSocket relay that survives Next.js hot-reloads and Vercel serverless cold starts.
- An OBS WebSocket bridge that maintains a persistent connection to OBS Studio.
- An n8n-style scheduler for the 24-hr programming grid auto-pilot.

When a mini-service is introduced:
- It lives in `mini-services/<name>/`.
- It has its own `package.json`, `tsconfig.json`, and `bun.lock`.
- It never imports from `src/`. It exposes HTTP/Socket.io; the main app talks to it via `?XTransformPort=<port>`.
- The decision is documented in an ADR under `docs/adr/`.

As of the v2 foundation, there are NO mini-services. All transport + data layer lives in the Next.js app.

---

## Settled Decisions (Don't Re-Litigate)

1. **Next.js App Router** (not Pages Router, not Remix, not raw Express).
2. **Next.js routes as scenes** (not a custom rendering engine, not a separate frontend app).
3. **OBS as the encoder** (not native WebRTC egress, not RTMP from the browser — Smile Live Kit produces what OBS shows).
4. **Socket.io** for console→scene transport (not raw WebSocket, not Server-Sent Events, not polling).
5. **Native WebSocket** for market data (not Socket.io — Deriv's WebSocket is the source; we just bridge it).
6. **Prisma + SQLite** for dev, **PostgreSQL** for prod (not raw SQL, not Drizzle, not Mongoose).
7. **Zustand** for client state (not Redux, not Jotai, not Recoil).
8. **TanStack Query** for server state (not SWR, not raw fetch + useEffect).
9. **shadcn/ui** for primitives (not Material UI, not Ant Design, not Chakra).
10. **Tailwind 4** for styling (not CSS Modules, not styled-components, not vanilla-extract).
11. **W21 mark as code** (not a static SVG asset, not a PNG, not a hand-drawn approximation in each scene).
12. **Single Next.js app, no mini-services** unless an ADR justifies one.

---

*Next: [`03-PROJECT_STRUCTURE.md`](03-PROJECT_STRUCTURE.md) for the full file tree.*
