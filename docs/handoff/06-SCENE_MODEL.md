# 06 — SCENE MODEL

## How Scenes + Overlays Are Structured

This document specifies the scene/overlay route model — the layout, the frame, the composition rules, the preset system, and the OBS Browser Source wiring.

---

## The 1920×1080 Contract

Every scene and every overlay renders at exactly **1920×1080** (16:9). This is non-negotiable.

- **Why 1920×1080:** OBS Browser Source's default size is 1920×1080. Designing at this resolution means the scene renders pixel-perfect in OBS with no scaling artifacts.
- **Why not 1280×720 or 3840×2160:** 720p is too low for modern streaming (YouTube transcodes down from 1080p; OBS streams look soft at 720p source). 4K is overkill for a browser-rendered scene (CPU/GPU cost outweighs visual benefit; most viewers watch at 1080p or below). 1080p is the sweet spot.
- **For 4K streams (future):** OBS scales the 1920×1080 Browser Source up to 3840×2160. The scene renders crisply because it's vector + DOM (not raster). Acceptable.

---

## The SceneFrame Component

Every scene route wraps its content in `<SceneFrame>`:

```tsx
// src/app/scenes/trading-live/page.tsx
import { SceneFrame } from '@/components/scene/SceneFrame'
import { W21Lockup } from '@/components/w21/W21Lockup'
import { Ticker } from '@/components/scene/Ticker'
import { PriceReadout } from '@/components/scene/PriceReadout'

export default function TradingLiveScene() {
  return (
    <SceneFrame channel="trading">
      {/* Top-left: the W21 lockup */}
      <div className="absolute top-8 left-8">
        <W21Lockup channel="trading" size={96} />
      </div>

      {/* Top-right: live indicator + clock */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <LiveBadge />
        <Clock timezone="EAT" />
      </div>

      {/* Center: primary content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PriceReadout symbol="V75" />
      </div>

      {/* Bottom: ticker */}
      <Ticker channel="trading" symbols={['V75', 'V100', 'EUR/USD']} />
    </SceneFrame>
  )
}
```

### `SceneFrame` props + behavior

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `channel` | `ChannelKey` | (required) | Sets `--w21-active` to the channel color. Drives the W21 lockup + ticker accent. |
| `className` | `string` | — | Passthrough for scene-specific overrides. |
| `grid` | `'default' \| 'dense' \| 'sparse' \| 'none'` | `'default'` | The structural grid pattern. `'none'` is for scenes that intentionally omit the grid (rare — document why in the scene file). |
| `safeArea` | `boolean` | `true` | When true, renders a subtle 96px safe-area guide in dev mode (hidden in production). |

### What `SceneFrame` enforces

```tsx
// Pseudocode of SceneFrame's root
<div
  ref={frameRef}
  className={cn('scene-frame bg-grid', grid === 'dense' && 'bg-grid-dense', grid === 'sparse' && 'bg-grid-sparse', className)}
  style={{
    width: '1920px',
    height: '1080px',
    position: 'relative',
    overflow: 'hidden',
    background: '#0A0A0A',
    // --w21-active is set by the channel prop
    ['--w21-active' as any]: `var(--w21-${channel})`,
  }}
  data-channel={channel}
  data-scene={sceneName}
>
  {children}
</div>
```

The frame is a 1920×1080 box. All children are absolutely positioned within it (or use flex/grid inside an absolute container). The `overflow: hidden` clips anything that bleeds outside the frame.

### The body + html for scene routes

In `src/app/scenes/layout.tsx` (a route-group layout):

```tsx
export default function ScenesLayout({ children }) {
  return (
    <>
      <style>{`html, body { background: #0A0A0A !important; margin: 0; padding: 0; overflow: hidden; }`}</style>
      {children}
    </>
  )
}
```

This kills the default body padding, hides scrollbars, and locks the background to Terminal Black.

---

## The OverlayFrame Component

Every overlay route wraps its content in `<OverlayFrame>`:

```tsx
// src/app/overlays/ticker/page.tsx
import { OverlayFrame } from '@/components/scene/OverlayFrame'
import { Ticker } from '@/components/scene/Ticker'

export default function TickerOverlay() {
  return (
    <OverlayFrame>
      <Ticker channel="trading" symbols={['V75', 'V100']} position="bottom" />
    </OverlayFrame>
  )
}
```

### What `OverlayFrame` enforces

- 1920×1080 root with `overflow: hidden`.
- **Transparent background.** The `<html>` and `<body>` are set to `background: transparent` via a route-group layout (`src/app/overlays/layout.tsx`).
- No structural grid (overlays are graphics layers, not scenes — the grid would compete with the underlying OBS canvas).
- Children positioned absolutely where OBS expects them.

### The body + html for overlay routes

In `src/app/overlays/layout.tsx`:

```tsx
export default function OverlaysLayout({ children }) {
  return (
    <>
      <style>{`html, body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }`}</style>
      {children}
    </>
  )
}
```

OBS's default Browser Source CSS (`body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }`) is compatible with this — do not override OBS's CSS.

---

## Scene Presets

A scene preset is a reusable scene configuration — a saved layout + content. The console's SceneSwitcherPanel shows the preset library; clicking one loads the preset into the active scene route.

### The preset types (v2 launch set)

| Preset | Route | Use |
|--------|-------|-----|
| `Starting Soon` | `/scenes/starting-soon` | Pre-roll — "Starting Soon" big text, countdown, W21 lockup. |
| `Live` (Trading) | `/scenes/trading-live` | The main W21 Trading live trade scene — W21 lockup, host frame, live price readout, ticker. |
| `Be Right Back` | `/scenes/be-right-back` | Interstitial — "Be Right Back" big text, animated W21 mark. |
| `Off Air` | `/scenes/off-air` | 24/7 fill — "Off Air" big text, schedule of next live block. |
| `Lesson Replay` | `/scenes/lesson-replay` (future) | Wraps a VOD in the W21 frame — lesson title, module badge, ticker. |
| `Signal Review` | `/scenes/signal-review` (future) | Community signal review — grid of recent signals, win/loss tally. |
| `Curriculum Ladder` | `/scenes/curriculum` (future) | The 5-module ladder graphic — Step Index → V100. |

### Curriculum-ladder presets (W21 Trading)

Per [`../verticals/w21-trading/CONTENT_STRATEGY.md`](../verticals/w21-trading/CONTENT_STRATEGY.md) §"Curriculum Ladder":

| Preset | Module | Energy |
|--------|--------|--------|
| `Step Index` | Module 1 (Safest) | Low — chart reading, support/resistance |
| `V10` | Module 2 (Low Vol) | Low — first exposure to volatility mechanics |
| `V25 → V50` | Module 3 (Moderate) | Medium — risk management, position sizing |
| `Range Break / Boom & Crash` | Module 4 (Patterns) | Medium — pattern recognition, breakout trading |
| `V75 → V100` | Module 5 (High Vol) | High — advanced strategies, trading psychology |

Each curriculum preset has: the W21 lockup, the module badge (top-right), the lesson title (center), the curriculum-ladder progress bar (bottom, above the ticker), and the ticker.

### The preset storage model (Prisma)

```prisma
model ScenePreset {
  id          String   @id @default(cuid())
  name        String   // "Starting Soon", "Trading Live", etc.
  channel     String   // ChannelKey — "trading", "news", etc.
  route       String   // "/scenes/trading-live"
  config      Json     // Scene-specific config (symbols, text, layout variant)
  thumbnail   String?  // Optional poster image URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

The console reads the preset library via `GET /api/scene/presets`. Saving a new preset is `POST /api/scene/presets`. Switching the active scene is a Socket.io `state` event (`{ activeScene: presetId }`).

---

## The W21 Lockup Placement

The W21 lockup (mark + pipe + channel name) appears in the **top-left** of every scene, at 96px mark size, 32px from the top and left edges.

```
┌────────────────────────────────────────────────────────────────┐
│ ●W21│TRADING                                          LIVE 14:23 │
│                                                                │
│                                                                │
│                                                                │
│                       (primary content)                        │
│                                                                │
│                                                                │
│                                                                │
│ ▶ V75 1,234.56 +2.34%  ▶ V100 5,678.90 -0.18%  ▶ EUR/USD 1.0854│
└────────────────────────────────────────────────────────────────┘
```

The lockup is always 96px mark + 8px gap + 3px pipe + 16px gap + channel name. The channel name is Grid White, uppercase, `tracking-[0.15em]`, mono (it's a label, not body text — mono gives it the institutional feel).

The lockup NEVER moves. It is the visual anchor — viewers recognize it across channels.

---

## Tally + Live Indicator

### The Live badge
A small pill in the top-right of the scene:

```
● LIVE
```

- Red dot (Alert Magenta `#FF006E`), pulsing at 1.5Hz (Framer Motion `animate={{ scale: [1, 1.15, 1] }}`).
- `LIVE` text in mono, Grid White, `tracking-wider`, 14px.
- Background: Terminal Black with 80% opacity, hairline Grid White border at 20%.
- Hidden when the scene is in "off-air" or "starting-soon" state.

### The tally state
The tally state is set by the console (via Socket.io `state` event) and reflects the OBS Studio Mode state:

| State | Color | Meaning |
|-------|-------|---------|
| `program` | Red (`#FF006E`) | This scene is live — being broadcast. |
| `preview` | Green (`#22C55E`) | This scene is cued — next to go live. |
| `cued` | Amber (`#FF8C00`) | This scene is in the cue list. |
| `idle` | Zinc (`#27272A`) | This scene is not in use. |

The console's `TallyIndicator` shows the same states for the operator.

---

## The Ticker

The ticker is the bottom strip of the scene (and a standalone overlay route). It scrolls live market data + custom text from the console.

### Anatomy (left → right)

1. **Leading edge** — a 4px-wide vertical bar in the channel color.
2. **Symbol** — mono, 24px, Grid White (e.g., `V75`).
3. **Price** — mono, 24px, Grid White, `tabular-nums` (e.g., `1,234.56`).
4. **Delta** — mono, 18px, bull-green or bear-red, with `+` / `-` prefix and `%` suffix.
5. **Separator** — a 16px gap, then a 1px hairline Grid White divider at 20% opacity, then a 16px gap.
6. Repeat 2-5 for each symbol.
7. **Custom text segment** — after the symbols, the console's ticker text scrolls. Same mono typography.

### Animation
- The ticker scrolls right-to-left at 60px/sec (configurable). Framer Motion `useAnimationFrame` drives the transform.
- On hover (in the console preview only — not on the OBS-rendered scene), the ticker pauses.
- When new data arrives (Socket.io `data` event for a new price), the corresponding symbol's price updates with a 200ms ease-out flash (Grid White → channel color → Grid White).

### The ticker component API

```tsx
<Ticker
  channel="trading"
  symbols={['V75', 'V100', 'V25', 'V50', 'EUR/USD', 'USD/KES']}
  customText="Welcome to W21 Trading — the first 24/7 trading education channel."
  speed={60}  // px/sec
  position="bottom"  // "bottom" | "top"
/>
```

---

## Scene Routes — Naming Convention

- Lowercase, hyphenated: `trading-live`, `starting-soon`, `be-right-back`, `off-air`, `lesson-replay`, `signal-review`, `curriculum`.
- Channel-prefixed when the scene is channel-specific: `trading-live`, `news-breaking` (future), `politics-debate` (future).
- Generic scenes (Starting Soon, Be Right Back, Off Air) take a `channel` prop and adapt — they're not duplicated per channel.

---

## OBS Browser Source Wiring

The OBS operator wires Smile Live Kit scenes as Browser Sources:

1. **Add a Browser Source** in OBS (Sources → + → Browser).
2. **URL:** `https://smile-live-kit.vercel.app/scenes/trading-live`.
3. **Width:** 1920. **Height:** 1080.
4. **Custom CSS:** leave the OBS default. (For overlays, the default transparent CSS is what we want.)
5. **Shutdown source when not visible:** ✅ (saves CPU when the scene is not on program/preview).
6. **Refresh browser when scene becomes active:** ✅ (ensures the scene re-hydrates on activation).

### The scene collection
For a typical W21 Trading broadcast, the OBS scene collection has:

- **Scene: "Pre-roll"** → Browser Source: `/scenes/starting-soon`
- **Scene: "Live"** → Browser Source: `/scenes/trading-live` + a video capture source (host camera) + an audio capture source (host mic).
- **Scene: "Be Right Back"** → Browser Source: `/scenes/be-right-back`
- **Scene: "Off Air"** → Browser Source: `/scenes/off-air`
- **Overlay sources** (added to each scene as needed): Browser Source: `/overlays/ticker`, Browser Source: `/overlays/lower-third`.

The console's future SceneCollectionExport feature (`/api/scene/export-obs`) generates this JSON.

---

*Next: [`07-OBS_INTEGRATION.md`](07-OBS_INTEGRATION.md) for the full OBS integration model.*
