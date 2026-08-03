# 08 — CONTROL CONSOLE

## The Grandma-Operable Panel at `/`

The control console is the operator's surface. It is the one Smile Live Kit route that is NOT a scene and NOT an overlay — it is the cockpit. It lives at `/` and is composed of panels.

The defining principle: **grandma-operable.** The console is designed for a person who is not a developer, not a streamer, not a video engineer. It is designed for an on-air talent's mother who has been asked to "press the button when the lesson starts." Every panel respects that audience.

---

## The Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ●W21│TRADING        [Trading] [News] [Politics] [Agr] ...    ● LIVE  02:34:11  ⚙   │  ← Header (64px)
├──────────────────────────────────────────────────────────┬───────────────────────────┤
│                                                          │  TALLY                    │
│  SCENE SWITCHER                                          │  ● PROGRAM (red)          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │                           │
│  │Start │ │ Live │ │ BRB  │ │Off   │                    │  STREAM HEALTH            │
│  │Soon  │ │ ●    │ │      │ │Air   │                    │  Bitrate: 4500 kbps       │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │  Dropped: 0 frames       │
│                                                          │  Uptime:  02:34:11        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │                           │
│  │Step  │ │ V10  │ │ V25→ │ │Range │                    │  SCHEDULE                 │
│  │Index │ │      │ │ V50  │ │Break │                    │  Now: London Session      │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │  Next: Risk & Psychology  │
│                                                          │  Auto-pilot: ON           │
│  TICKER EDITOR                                           │                           │
│  ┌────────────────────────────────────────────────────┐ │  [Toggle Auto-pilot]      │
│  │ Welcome to W21 Trading — first 24/7 trading edu... │ │                           │
│  └────────────────────────────────────────────────────┘ │  PRESETS                  │
│  [▶ V75] [▶ V100] [▶ EUR/USD]   [Send to scene]        │  + Starting Soon          │
│                                                          │  + Live (Trading)         │
└──────────────────────────────────────────────────────────┴───────────────────────────┘
```

### The three zones

1. **Header (64px tall, sticky):** W21 lockup (active channel) + ChannelSelector + StreamHealth summary + Settings button.
2. **Main (flex-1):** SceneSwitcherPanel (grid of cards) + TickerEditor (below the grid).
3. **Right rail (320px, collapsible):** TallyIndicator + StreamHealthPanel + SchedulePanel + Presets panel.

On narrow viewports (tablet), the right rail collapses to a tab that slides in. On mobile (future, view-only), the layout stacks vertically.

---

## The Panels

### 1. SceneSwitcherPanel

A grid of scene cards. Each card represents a scene preset (Starting Soon, Live, Be Right Back, Off Air, Step Index, V10, V25→V50, Range Break, V75→V100).

**Card anatomy:**
- 240×135px card (16:9 thumbnail aspect).
- Zinc background, hairline Grid White border at 10%.
- Top stripe: the active channel color (4px).
- Thumbnail: a live `<iframe>` preview of the scene route (scaled to fit the card) OR a static poster image (default — live iframe is opt-in for performance).
- Scene name: bottom-left, mono, 14px, Grid White.
- Tally dot: top-right, 8px. Red (program), green (preview), amber (cued), zinc (idle).

**Interactions:**
- **Click** → set as preview (highlights the card with a green ring + sets the tally dot to green).
- **Double-click** → set as program (cut transition; the tally dot turns red; the previous program's dot turns zinc).
- **Right-click** → context menu: Rename, Duplicate, Edit Note, Delete, Export as OBS Scene Collection entry.
- **Drag** → reorder the grid (Drag-and-drop via `@dnd-kit/sortable`).

**State:**
- `activeScene` (the program scene) — Zustand store, synced to OBS via WebSocket (`SetCurrentProgramScene`).
- `previewScene` — Zustand store, synced via `SetCurrentPreviewScene` (Studio Mode only).

### 2. ChannelSelector

A horizontal list of 12 channel buttons + the parent. Each button shows the W21 mark (24px) + the channel name (mono, 12px, Grid White).

**Interactions:**
- **Click** → set the active channel. The console's `--w21-active` CSS variable updates; every component that uses `var(--w21-active)` recolors. A Socket.io `state` event (`{ channel: 'news' }`) is emitted; every connected scene route recolors its W21 mark + ticker accent.

**The active state:** the button gets a 2px ring in the channel color. The inactive buttons stay flat.

**The parent button:** the leftmost, in Unity Gold. Activating "parent" puts the console into "ecosystem mode" — the lockup shows the World 21 master mark, the channel name shows "WORLD 21". Used for cross-channel announcements.

### 3. TickerEditor

A text field + symbol-injector buttons + a "Send to scene" button.

**Anatomy:**
- Text field: 80px tall, full-width of the main zone. Mono font (the ticker is mono). 16px text. Grid White text on Zinc background. Hairline Grid White border at 10%.
- Symbol-injector buttons: a horizontal list of the active channel's relevant symbols (for Trading: V75, V100, V25, V50, Step Index, EUR/USD, USD/KES). Clicking a symbol appends `▶ <SYMBOL>` to the text field at the cursor position. The injected symbol is rendered with a colored background (the channel color at 20% opacity) so the operator can see it as a "live chip" that will pull the current price.
- "Send to scene" button: primary CTA, Grid White bg, Terminal Black text. Emits a Socket.io `ticker` event (`{ text, symbols }`). Every connected scene route's ticker updates within ~50ms.
- Recent ticker messages: a dropdown of the last 10 messages. Click to re-load into the text field.

**Symbol chips in the text:** when the operator types `▶ V75`, the editor recognizes the pattern and renders it as a chip (colored background + the live price) rather than plain text. The chip's price updates in real time via the data layer.

### 4. TallyIndicator

A big tally light in the right rail. 80×80px circle. Color reflects the active scene's tally state:
- Red (`#FF006E`) — program (live).
- Green (`#22C55E`) — preview (cued).
- Amber (`#FF8C00`) — cued (in the cue list).
- Zinc (`#27272A`) — idle.

Below the light: a label (PROGRAM / PREVIEW / CUED / IDLE) + the active scene's name.

When the state changes, the light flashes (Framer Motion: scale 1 → 1.15 → 1 over 150ms) + the color transitions over 200ms.

### 5. StreamHealthPanel

Live stream health metrics, polled from OBS WebSocket (`GetStreamStatus`) every 5s (or from YouTube Live API if OBS is not connected).

**Metrics:**
- **Bitrate** — `tabular-nums`, mono, 18px. Target: 4500 kbps for 1080p30. Color: green (≥4000), amber (3000-4000), red (<3000).
- **Dropped frames** — `tabular-nums`, mono, 18px. Target: 0. Color: green (0-10), amber (11-50), red (>50).
- **Uptime** — `tabular-nums`, mono, 18px. Format: `HH:MM:SS`.
- **CPU usage** (OBS process) — bar chart, 0-100%. Color: green (<60%), amber (60-85%), red (>85%).
- **Stream status** — `LIVE` (red badge) / `IDLE` (zinc badge) / `CONNECTING` (amber badge, pulsing).

When OBS is not connected (no WebSocket configured), the panel shows a "Connect to OBS" prompt + a manual-stream-status toggle (the operator clicks "I'm live" to set the badge — useful for FFmpeg-only setups).

### 6. SchedulePanel

The 24-hour programming grid for the active channel (per [`../verticals/w21-trading/CONTENT_STRATEGY.md`](../verticals/w21-trading/CONTENT_STRATEGY.md)).

**Anatomy:**
- A vertical list of the day's 8 blocks (Late Session Replay, Beginner Curriculum, Asian Session, Intermediate Curriculum, London Session, Risk & Psychology, Prime Time Signals, Advanced Curriculum).
- Each block: start time (mono, EAT), block name, content description, energy badge (low/medium/high — color-coded).
- The current block is highlighted (channel-color border + a "NOW" badge).
- The next block is dimmed (next-up indicator).
- "Auto-pilot: ON/OFF" toggle. When ON, the console auto-switches scenes at each block boundary (via the SchedulePanel's internal scheduler + Socket.io `state` events).

**Auto-pilot logic:** the scheduler runs in the browser (with a server-side fallback for resilience). At each block boundary (00:00, 02:00, 06:00, 08:00, 12:00, 14:00, 18:00, 20:00 EAT), it emits a `state` event with the new active scene. The operator can override (click a different scene card → auto-pilot pauses for the remainder of the current block).

### 7. Presets panel (right rail, below SchedulePanel)

A list of saved scene presets + an "Add preset" button.

- Click a preset → loads it into the SceneSwitcherPanel (replaces the current grid).
- "Add preset" → opens a dialog: name, channel, route, config (JSON). Saves via `POST /api/scene/presets`.

---

## State Management

The console's state is Zustand:

```ts
// src/lib/console/store.ts
interface ConsoleState {
  activeChannel: ChannelKey
  activeScene: string | null  // preset ID
  previewScene: string | null
  tally: 'program' | 'preview' | 'cued' | 'idle'
  ticker: { text: string; symbols: string[] }
  streamStatus: 'live' | 'idle' | 'connecting' | 'error'
  schedule: ScheduleBlock[]
  autoPilot: boolean
  obsConnected: boolean

  // actions
  setChannel: (ch: ChannelKey) => void
  setScene: (presetId: string, mode: 'preview' | 'program') => void
  updateTicker: (text: string, symbols: string[]) => void
  toggleAutoPilot: () => void
  // ...
}
```

The store is the single source of truth for the console. Each action:
1. Updates the Zustand state (optimistic — the UI updates immediately).
2. Emits a Socket.io event (the scenes update).
3. If OBS WebSocket is connected, calls the corresponding OBS method (the OBS preview/program updates).

If step 2 or 3 fails, the console shows a "transport error" banner and reverts the optimistic update.

---

## Grandma-Operable Principles (Recap)

1. **Big hit targets** — minimum 44×44px. The console is operable on a touch tablet.
2. **No jargon** — "Switch to this scene" not "Cut to program"; "Live now" not `PROGRAM` (the label is `PROGRAM` for technical accuracy, but the tooltip says "This scene is live now").
3. **Always-visible state** — the active channel, the active scene, the tally, the stream status are in the header + right rail. The operator never has to dig.
4. **Forgiving** — every action has an undo. The console keeps a 10-step history; Ctrl+Z reverts the last state change.
5. **Phone-friendly** — the right rail collapses to a tab on narrow viewports. The SceneSwitcherPanel becomes a vertical list. The TickerEditor stays at the bottom.
6. **No code, no terminals** — the console never shows a JSON, a URL, a script. Settings are form-driven.
7. **Tooltips everywhere** — every icon button has a tooltip (shadcn/ui Tooltip) explaining what it does.

---

## The Settings Panel (Behind the Gear Icon)

The Settings panel (modal, opened from the gear icon in the header) holds the non-grandma-friendly config:

- **OBS WebSocket** — URL + password. Status: Connected / Disconnected / Error.
- **Market data** — Deriv API token (server-side), Twelve Data API key (server-side), budget-gating thresholds, simulated-fallback toggle.
- **Stream** — RTMP key (for the future Smile Live Kit streaming feature), YouTube channel ID, stream title, stream description.
- **Schedule** — the 24-hr programming grid editor (a table; each row is a block).
- **Theme** — dark (default) / high-contrast (future).
- **About** — version, commit SHA, links to docs.

The Settings panel is the only place a developer-y thing appears. Grandma never opens it; the operator's tech-savvy child does, once, at install time.

---

## The Console Footer

A 32px-tall footer (sticky to bottom — `min-h-screen flex flex-col` + `mt-auto`):

- Left: `Smile Live Kit v0.2.1` + the current commit SHA (mono, 12px, Grid White at 60%).
- Center: a "Console connected" / "Console disconnected" indicator (green/red dot).
- Right: links to docs (`AGENTS.md`, `docs/handoff/00-MASTER-HANDOFF-INDEX.md`) — for developers, not grandma.

---

*Next: [`09-FEATURES.md`](09-FEATURES.md) for the feature list + OBS parity matrix.*
