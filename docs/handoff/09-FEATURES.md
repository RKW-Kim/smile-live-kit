# 09 — FEATURES

## Feature List + OBS Parity Matrix + Roadmap

This is the catalog of Smile Live Kit features, mapped to OBS parity and prioritized. Update this doc as features ship.

**Legend:**
- ✅ Done — implemented, verified, shipping.
- 🚧 In progress — being built (cite the worklog Task ID).
- 📋 Roadmap — planned, not started. Cite the vertical / research source.
- ❌ Out of scope — explicitly not building. Cite why.

---

## Scene Routes

| Feature | Status | OBS Parity | Notes |
|---------|--------|------------|-------|
| `/scenes/trading-live` (W21 Trading live trade scene) | 🚧 In progress | OBS Browser Source | Built by the code subagent (Task ID `CODE-1`). Per Prompt 07 spec. |
| `/scenes/starting-soon` | 📋 Roadmap | OBS Browser Source | Pre-roll scene — countdown, W21 lockup, music. |
| `/scenes/be-right-back` | 📋 Roadmap | OBS Browser Source | Interstitial — animated W21 mark, "BRB" text. |
| `/scenes/off-air` | 📋 Roadmap | OBS Browser Source | 24/7 fill — "Off Air" + next-live schedule. |
| `/scenes/lesson-replay` | 📋 Roadmap | OBS Browser Source | Wraps a VOD in the W21 frame. |
| `/scenes/signal-review` | 📋 Roadmap | OBS Browser Source | Community signal review — grid of recent signals. |
| `/scenes/curriculum` | 📋 Roadmap | OBS Browser Source | The 5-module ladder graphic. |
| Channel-conditional scenes (News, Politics, etc.) | 📋 Roadmap | OBS Browser Source | Future verticals. The scene route takes `channel` as a query param OR is duplicated per channel. |

---

## Overlay Routes

| Feature | Status | OBS Parity | Notes |
|---------|--------|------------|-------|
| `/overlays/ticker` | 📋 Roadmap | OBS Browser Source | Live market-data ticker. Transparent body. |
| `/overlays/lower-third` | 📋 Roadmap | OBS Browser Source | Animated lower-third (guest name, topic, breaking news). |
| `/overlays/alert` | 📋 Roadmap | Streamlabs Cloudbot parity (community plugin equivalent) | Follow/sub/donation/raid alerts. Future. |
| `/overlays/input` | 📋 Roadmap | Input Overlay (community plugin) | Keyboard/controller overlay. Future. |
| `/overlays/scene-bug` | 📋 Roadmap | OBS Browser Source | Persistent W21 lockup in the top-right. Future. |

---

## Control Console Panels

| Feature | Status | OBS Parity | Notes |
|---------|--------|------------|-------|
| ConsoleShell (layout: header + main + right rail) | 🚧 In progress | — | Built by the code subagent (Task ID `CODE-1`). |
| SceneSwitcherPanel | 📋 Roadmap | OBS Scenes panel | Grid of scene cards with tally dots. |
| ChannelSelector | 📋 Roadmap | — (W21-specific) | 12 channels + parent. |
| TickerEditor | 📋 Roadmap | — (W21-specific) | Text field + symbol chips + "Send to scene". |
| TallyIndicator | 📋 Roadmap | OBS Studio Mode tally | Big red/green/amber light. |
| StreamHealthPanel | 📋 Roadmap | OBS Stats panel | Bitrate, dropped frames, uptime, CPU. |
| SchedulePanel (24-hr grid) | 📋 Roadmap | Advanced Scene Switcher (community plugin) | 8-block grid + auto-pilot toggle. |
| Presets panel | 📋 Roadmap | OBS Scene Collections | Saved scene presets library. |
| Settings panel (OBS WebSocket, market data, stream config) | 📋 Roadmap | OBS Settings | Form-driven config. |
| Command palette (Ctrl+K) | 📋 Roadmap | OBS command-palette-style | Quick-action search. Future. |
| Hotkeys (Ctrl+1-9 for scene switch, etc.) | 📋 Roadmap | OBS Hotkeys | Mirror OBS's hotkey defaults. |

---

## W21 Brand System

| Feature | Status | Notes |
|---------|--------|-------|
| `W21Mark` component (sacred) | ✅ Done | `src/components/w21/W21Mark.tsx`. Rule 2 — do not modify. |
| `W21Lockup` component (mark + pipe + channel name) | ✅ Done | `src/components/w21/W21Lockup.tsx`. |
| Channel color map (12 channels + parent) | ✅ Done | `src/lib/w21/channels.ts`. |
| System colors (Terminal Black, Grid White, Zinc, Alert Magenta, bull, bear) | ✅ Done | Same file. |
| `W21Watermark` (ghost mark for scene corners) | 📋 Roadmap | Future component. |
| `W21Favicon` (dynamic per-channel favicon) | 📋 Roadmap | Future component. |
| Brand-system documentation | ✅ Done | `docs/brand/IDENTITY_SYSTEM.md`. |

---

## Market Data Layer

| Feature | Status | Source | Notes |
|---------|--------|--------|-------|
| Deriv WebSocket client (synthetic indices) | 📋 Roadmap | Deriv API | `src/lib/data/deriv.ts`. Push-based, no polling. |
| Twelve Data REST client (forex) | 📋 Roadmap | Twelve Data API | `src/lib/data/twelvedata.ts`. Cached, budget-aware. |
| Budget-gating layer | 📋 Roadmap | — (W21-specific) | `src/lib/data/budgetGate.ts`. Daily budget + simulated fallback. |
| Simulated random-walk fallback | 📋 Roadmap | — (W21-specific) | When budget exhausted; labeled "SIM" in UI. |
| Ticker data widget | 📋 Roadmap | — (W21-specific) | `src/components/scene/Ticker.tsx`. |
| Price readout widget | 📋 Roadmap | — (W21-specific) | `src/components/scene/PriceReadout.tsx`. |

---

## Transport

| Feature | Status | Notes |
|---------|--------|-------|
| Socket.io server (Next.js-attached) | 📋 Roadmap | `src/lib/transport/socketServer.ts`. See `11-TRANSPORT_REALTIME.md`. |
| Socket.io client (singleton) | 📋 Roadmap | `src/lib/transport/socketClient.ts`. |
| Typed event map (state, ticker, data, presence, chat) | 📋 Roadmap | `src/lib/transport/events.ts`. |
| TransportProvider (React context) | 📋 Roadmap | `src/components/transport/TransportProvider.tsx`. |
| TransportReconnectBanner | 📋 Roadmap | Banner when the socket drops. |
| OBS WebSocket bridge (optional) | 📋 Roadmap | `obs-websocket-js`. See `07-OBS_INTEGRATION.md`. |

---

## Scene Presets

| Feature | Status | Notes |
|---------|--------|-------|
| Starting Soon | 📋 Roadmap | Pre-roll. |
| Live (Trading) | 🚧 In progress | The W21 Trading live scene. |
| Be Right Back | 📋 Roadmap | Interstitial. |
| Off Air | 📋 Roadmap | 24/7 fill. |
| Lesson Replay | 📋 Roadmap | VOD wrapper. |
| Signal Review | 📋 Roadmap | Community signals grid. |
| Curriculum Ladder presets (5 modules) | 📋 Roadmap | Step Index → V100. Per `verticals/w21-trading/CONTENT_STRATEGY.md`. |
| Scene preset library (CRUD) | 📋 Roadmap | `GET/POST/PUT/DELETE /api/scene/presets`. |
| Scene Collection export to OBS JSON | 📋 Roadmap | Round-trip parity with OBS. |

---

## OBS Integration

| Feature | Status | OBS Parity | Notes |
|---------|--------|------------|-------|
| Browser Source at 1920×1080 | 🚧 In progress | OBS Browser Source | The core integration. |
| Scene Collection import (read OBS JSON) | 📋 Roadmap | OBS Scene Collection | Future — load an existing OBS scene collection into Smile Live Kit. |
| Scene Collection export (write OBS JSON) | 📋 Roadmap | OBS Scene Collection | Future — generate OBS JSON from the preset library. |
| OBS WebSocket drive (cut, transition, scene switch) | 📋 Roadmap | OBS WebSocket | Optional — when configured. |
| OBS WebSocket read (stream status, tally) | 📋 Roadmap | OBS WebSocket | Optional. |
| Hotkey mirroring (Ctrl+1-9 for scene switch) | 📋 Roadmap | OBS Hotkeys | Future. |

---

## Vertical-Specific Features

### W21 Trading

| Feature | Status | Source | Notes |
|---------|--------|--------|-------|
| 24-hr programming grid (8 blocks) | 📋 Roadmap | `verticals/w21-trading/CONTENT_STRATEGY.md` | The SchedulePanel's content. |
| Curriculum-ladder presets | 📋 Roadmap | `verticals/w21-trading/CONTENT_STRATEGY.md` | 5 modules. |
| Deriv synthetic-indices symbols (V10-V100, Step Index, Range Break, Boom & Crash) | 📋 Roadmap | `verticals/w21-trading/CONTENT_STRATEGY.md` | The ticker's default symbol set. |
| Auto-pilot (auto-scene-switch on schedule) | 📋 Roadmap | Advanced Scene Switcher (community plugin) | The SchedulePanel's auto-pilot toggle. |
| Trade journal (Prisma model) | 📋 Roadmap | — (W21-specific) | Future — for the operator's record. |

### Future verticals (out of v2 scope)
- W21 News — `/scenes/news-breaking`, RSS feed ticker, press-amber accent.
- W21 Politics — `/scenes/politics-debate`, debate timer, sovereign-crimson accent.
- W21 Agriculture — `/scenes/agri-market`, harvest-green accent, commodity prices.
- W21 Education — `/scenes/edu-lesson`, knowledge-blue accent, lesson plan side panel.
- (Other channels follow the same pattern.)

---

## Out of Scope (Explicit)

| Feature | Why |
|---------|-----|
| Audio mixing (per-source volume, EQ, compressor) | OBS handles audio. Smile Live Kit scenes are silent by default. Future overlay route for an audio-levels visualization is possible. |
| Video encoding / RTMP egress | OBS (or FFmpeg on the VPS for 24/7) is the encoder. Smile Live Kit produces what OBS shows. |
| Local recording / replay buffer | OBS handles it. |
| Multi-platform chat aggregation (Twitch, YouTube, Discord in one feed) | Future. Not v2. |
| Cloudbot / merch / Streamlabs-style monetization | Out of scope — Streamlabs does this; we don't compete. |
| Mobile-first console | Mobile is view-only (future). The console is tablet-minimum. |
| Light mode | Dark theme only. The W21 brand is dark. |
| Stream to multiple platforms simultaneously (multistream) | OBS handles this (via Streamlabs multistream or via FFmpeg multi-RTMP on the VPS). Smile Live Kit produces one stream that OBS / FFmpeg distributes. |

---

## The OBS Parity Matrix — Summary

| OBS feature | Smile Live Kit equivalent | Status |
|--------------|---------------------------|--------|
| Browser Source | Next.js scene/overlay routes | ✅ Done (the architecture) |
| Scene Collections | Scene preset library + export | 📋 Roadmap |
| Source Transforms (position/scale/rotation/crop) | Out of scope (OBS handles this) | ❌ |
| Audio Mixer | Out of scope (OBS handles audio) | ❌ |
| Filters (chroma-key, blur, etc.) | Out of scope (OBS handles this) | ❌ |
| Replay Buffer | Out of scope (OBS handles this) | ❌ |
| Studio Mode (preview/program) | Console's SceneSwitcherPanel + TallyIndicator | 📋 Roadmap |
| Transitions (cut/fade/stinger) | OBS-driven; console triggers via WebSocket | 📋 Roadmap |
| Source locking/hiding | Console's source-visibility toggle (via WebSocket) | 📋 Roadmap |
| Hotkeys | Console's hotkey mirror | 📋 Roadmap |
| Statistics | Console's StreamHealthPanel | 📋 Roadmap |
| Profile/SLO management | Out of scope (OBS handles this) | ❌ |
| Multiview | Out of scope (OBS handles this) | ❌ |
| Dockable Panels | Console's panel layout (fixed, not dockable) | ❌ (intentional — grandma-operable) |
| Stream/Recording settings | Out of scope (OBS handles this) | ❌ |

---

*Next: [`10-DATA_FEEDS.md`](10-DATA_FEEDS.md) for the market-data layer.*
