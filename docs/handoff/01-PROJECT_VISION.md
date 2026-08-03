# 01 — PROJECT VISION

## Smile Live Kit — OBS-Focused Live-Streaming Scene & Overlay Kit for the W21 Ecosystem

### The One-Sentence Pitch

A Next.js application that renders full-screen 1920×1080 broadcast scenes and overlays as URL-addressable routes, consumed by OBS as Browser Sources, with a grandma-operable control console at `/` that drives them in real time.

### The Core Idea

OBS Studio is the gold standard for live streaming — it is free, open-source, mature, and used by everyone from solo streamers to professional broadcasters. But OBS's native UI for designing scenes is dense, technical, and intimidating to non-engineers. The "scene composition" surface — where branding, data, video, and lower-thirds come together — is where most operators get stuck.

Smile Live Kit does NOT replace OBS. It extends OBS by giving the W21 ecosystem a **branded, opinionated, web-based scene-and-overlay kit**:

- Every scene is a **URL** — `https://smile-live-kit.vercel.app/scenes/trading-live`. The OBS operator loads it as a Browser Source at 1920×1080. Done.
- Every overlay is a **URL** — `https://smile-live-kit.vercel.app/overlays/ticker`. Same pattern, transparent body.
- The control console is a **URL** — `https://smile-live-kit.vercel.app/`. The operator opens it on a second monitor, an iPad, or a phone. Big buttons. Big readouts. No jargon.
- The console pushes state to the scenes via Socket.io. Switch the channel → the scene's status dot recolors in real time. Edit the ticker → the ticker overlay scrolls the new text. Click "go live" → the tally flips to red.

This is the "**OBS as the encoder, browser as the compositor**" pattern — proven by every newsroom that runs vizrt, Ross XPression, or Omneon Sundance in a browser front-end. We're doing it for free, with Next.js + OBS, branded for W21.

### Why Next.js Routes as Scenes?

Traditional broadcast graphics systems render scenes in proprietary engines (vizrt, XPression, Compix). They are expensive, locked-in, and operator-only. The browser-as-renderer pattern inverts this:

1. **URL-addressable** — every scene has a permalink. You can preview it in any browser, share it as a link, embed it in a dashboard, snapshot it for QA.
2. **OBS Browser Source native** — OBS Studio ships with a Browser Source since v21. A URL is a valid OBS source. No plugins required.
3. **Composable** — scenes are React components. The W21 mark, the ticker, the lower-thirds, the data widgets are all reusable across scenes.
4. **Live-editable** — change a prop, the scene updates. No render queue, no export step.
5. **Distributed-friendly** — the console can be on the operator's laptop, the scenes can be on the OBS machine, the data layer can be on a VPS. They communicate via Socket.io.
6. **Grandma-operable** — the console hides the React/Next.js complexity behind a panel of buttons, sliders, and text fields. The operator never sees code.

### Who It's For

1. **The W21 channel operators** — the on-air talent and their producers. They are not developers. They need a console that looks like a TV control surface, not a code editor.
2. **The OBS power user** — they want branded scene presets, a ticker that pulls live market data, a lower-thirds that animates on cue, all without leaving OBS. They add Smile Live Kit as Browser Sources and get all of it.
3. **The remote producer** — the person running the show from a phone or tablet. They open the console URL, switch scenes, edit tickers, monitor the stream — no OBS access required.
4. **The W21 brand owner** — smile.co.ke. The kit guarantees brand consistency: the W21 mark is the same on every channel, only the color changes. No operator can "forget" the branding.
5. **The 24/7 W21 Trading channel** — the launch vertical. A 24-hour programming grid of pre-recorded trading education content, streamed via FFmpeg on a VPS to YouTube Live, with Smile Live Kit scenes as the on-air graphics layer. (See [`../verticals/w21-trading/`](../verticals/w21-trading/).)

### What It Is NOT

- **NOT a video editor** — no timeline, no clips, no rendering out. Live broadcast only.
- **NOT a streaming encoder** — OBS (or FFmpeg on the VPS for 24/7) is the encoder. Smile Live Kit produces what OBS shows.
- **NOT a chat client** — YouTube/Twitch chat is ingested for alerts/overlays (future), not as a primary interface.
- **NOT mobile-first** — scenes are 1920×1080 (desktop OBS). The console is responsive to tablet minimum; mobile is view-only (future).
- **NOT a Streamlabs replacement** — Streamlabs adds extra features (Cloudbot, merch, themes, multistream) on top of OBS. Smile Live Kit focuses on the **branded scene/overlay/console layer**, not on the streaming-encoder or monetization layer.
- **NOT a vMix / Wirecast / Tricaster competitor** — those are professional multi-thousand-dollar broadcast switchers. Smile Live Kit is a free, web-native, brand-focused kit.

### The Architectural Pillars

| Pillar | What It Means | Where It's Documented |
|--------|---------------|------------------------|
| **Routes as scenes** | Each scene/overlay is a Next.js route at 1920×1080. OBS consumes it as a Browser Source. | [`06-SCENE_MODEL.md`](06-SCENE_MODEL.md), [`07-OBS_INTEGRATION.md`](07-OBS_INTEGRATION.md) |
| **Console as the operator surface** | The `/` route is the grandma-operable control panel. Big buttons, big readouts, no jargon. | [`08-CONTROL_CONSOLE.md`](08-CONTROL_CONSOLE.md) |
| **Socket.io for console→scene transport** | Real-time state (active scene, ticker text, channel color, tally) flows from console to scenes via Socket.io. | [`11-TRANSPORT_REALTIME.md`](11-TRANSPORT_REALTIME.md) |
| **WebSocket for market data** | Live market data (Deriv synthetic indices, Twelve Data forex) flows via native WebSocket through a budget-gating layer. | [`10-DATA_FEEDS.md`](10-DATA_FEEDS.md) |
| **W21 brand as code** | The mark, the channel color map, the typography, the grid — all encoded in `src/components/w21/` + `src/lib/w21/channels.ts`. | [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md), [`05-DESIGN_SYSTEM.md`](05-DESIGN_SYSTEM.md) |
| **OBS as the gold standard** | Every feature traces to OBS or a proven community plugin. | [`09-FEATURES.md`](09-FEATURES.md), `AGENTS.md` Rule 3 |

### The Design North Star

A Bloomberg Terminal × CNBC × Kenyan authenticity aesthetic — institutional, brutalist-Swiss, dark, monospaced where it counts, with a single chromatic accent per channel. Read [`05-DESIGN_SYSTEM.md`](05-DESIGN_SYSTEM.md) and [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md) for the full spec.

The W21 mark is the visual anchor. It is sacred (Rule 2). It appears in the top-left of every scene, in the console's header, in the favicon, in the watermark. The viewer sees it and instantly knows: this is W21, this is the [channel name] channel.

### The Gold Standards

1. **OBS Studio** — the structural benchmark. Every OBS feature should exist or be on the roadmap.
2. **OBS community plugins** — the extra-features benchmark. OBS WebSocket, StreamFX, Advanced Scene Switcher, Source Record, Move Transition.
3. **Bloomberg Terminal / CNBC on-air graphics** — the trading-readout aesthetic benchmark.
4. **Linear / Raycast / Vercel dashboard** — the dark UI / premium-UX benchmark (alignment is incidental — Smile Live Kit's aesthetic is independently derived from the W21 brand system).
5. **The W21 brand system** — the identity benchmark. The brand is the moat.

### The Long-Term Vision

1. **Multi-channel** — Trading is the launch channel; News, Politics, Agriculture, Innovation, Impact, Health, Education, Culture, Sports, Tech follow. Each gets its own scene presets, all sharing the W21 mark.
2. **Scene preset library** — a growing library of scene templates (Starting Soon, Live, Be Right Back, Off-Air, Lesson Replay, Live Trade, Signal Review, Community Q&A). The console lets the operator pick a template, customize text, and go.
3. **24-hr programming grid auto-pilot** — the console schedules scene switches on the W21 Trading 24-hour grid (see [`../verticals/w21-trading/CONTENT_STRATEGY.md`](../verticals/w21-trading/CONTENT_STRATEGY.md)). Combined with the VPS FFmpeg loop, this enables true 24/7 with no human in the loop for the fill blocks.
4. **OBS WebSocket bridge** — the console drives OBS directly (cut, transition, scene switch, source visibility, filter toggles) via `obs-websocket-js`. The operator never touches the OBS UI.
5. **Multi-platform** — Smile Live Kit scenes render identically in OBS, in Streamlabs (which uses Chromium Embedded), and in vMix's Web Browser input. The kit is OBS-first, not OBS-only.
6. **Plugin ecosystem (future)** — third-party scene/overlay presets, distributable as Next.js route bundles. The brand rules stay enforced centrally; the creative layer is open.

---

*Next: [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) for the deep technical architecture.*
