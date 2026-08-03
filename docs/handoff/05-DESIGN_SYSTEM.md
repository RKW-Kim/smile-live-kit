# 05 — DESIGN SYSTEM

## The Smile Live Kit Design Language

Smile Live Kit inherits its design language from the W21 brand system (see [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md) for the brand bible). This document specifies the **applied** design system — how the brand translates into Tailwind tokens, CSS variables, scene/overlay conventions, and console conventions.

The north star: **institutional, brutalist-Swiss, dark, monospaced where it counts, with a single chromatic accent per channel.** A Bloomberg Terminal × CNBC × Kenyan authenticity aesthetic.

---

## Color Tokens

### System colors (the structural palette)

| Token | Hex | Role |
|-------|-----|------|
| `terminal` | `#0A0A0A` | Page background. The base of every scene + the console. |
| `gridWhite` | `#F5F5F5` | Primary text. The mark border. The channel name in the lockup. Default button text. |
| `zinc` | `#27272A` | Panels. Card backgrounds. The W21 mark fill (the mark sits on Terminal Black, but its interior is Terminal Black — zinc is for *adjacent* surfaces like cards). |
| `alert` | `#FF006E` | Alert magenta. Breaking-news overlays, error states, destructive CTAs. |
| `bull` | `#22C55E` | Market up. (Same as Agriculture channel color — semantic alignment, not a conflict.) |
| `bear` | `#DC2626` | Market down. (Same as Politics channel color — semantic alignment.) |

### Channel colors (the chromatic accents)

The channel color map lives in `src/lib/w21/channels.ts` and **nowhere else**. Each channel has one signature color:

| Channel | Color | Hex |
|---------|-------|-----|
| World 21 (parent) | Unity Gold | `#F5A623` |
| Trading | Signal Cyan | `#00F0FF` |
| News | Press Amber | `#FF8C00` |
| Politics | Sovereign Crimson | `#DC2626` |
| Agriculture | Harvest Green | `#22C55E` |
| Innovation | Electric Indigo | `#6366F1` |
| Impact | Warm White | `#F0EDE5` |
| Health | Healing Teal | `#14B8A6` |
| Education | Knowledge Blue | `#3B82F6` |
| Culture | Sunset Coral | `#F97316` |
| Sports | Victory Lime | `#84CC16` |
| Tech | Plasma Violet | `#8B5CF6` |

**The hard rule:** Indigo `#6366F1` and Blue `#3B82F6` are channel colors (Innovation, Education). They appear ONLY when rendering those channels' identity. **Never** use indigo/blue as decorative accents in the console or in a non-Innovation/Education scene. Generic UI accents use the active channel's color, or Grid White / Zinc for neutral surfaces.

### CSS variables (in `globals.css`)

```css
:root {
  /* System */
  --w21-terminal: #0A0A0A;
  --w21-grid-white: #F5F5F5;
  --w21-zinc: #27272A;
  --w21-alert: #FF006E;
  --w21-bull: #22C55E;
  --w21-bear: #DC2626;

  /* Channels (mirror of src/lib/w21/channels.ts — kept in sync manually) */
  --w21-parent: #F5A623;
  --w21-trading: #00F0FF;
  --w21-news: #FF8C00;
  --w21-politics: #DC2626;
  --w21-agriculture: #22C55E;
  --w21-innovation: #6366F1;
  --w21-impact: #F0EDE5;
  --w21-health: #14B8A6;
  --w21-education: #3B82F6;
  --w21-culture: #F97316;
  --w21-sports: #84CC16;
  --w21-tech: #8B5CF6;

  /* Active channel (set by ChannelSelector on the console root) */
  --w21-active: var(--w21-trading);   /* default for the launch channel */

  /* Fonts */
  --font-geist-sans: ...;     /* set by next/font */
  --font-jetbrains-mono: ...; /* set by next/font */
}
```

The active channel color is set by the `ChannelSelector` on the console root element (`<html data-channel="trading">` or `<body style="--w21-active: var(--w21-trading);">`). Scenes do the same on their root. This lets every component reference `var(--w21-active)` for the "current channel" accent without prop-drilling.

---

## Typography

### Fonts
- **Geist Sans** — body, headings, channel names, UI labels. Variable font loaded via `next/font/google`.
- **JetBrains Mono** — every numeric readout. Variable weights: 400, 500, 700, 800. Loaded via `next/font/google`.

### The mono rule (Brand Rule 5)
Numbers are always monospaced. This is not aesthetic preference — it is functional. A monospaced price readout doesn't shift its column width as digits change, which prevents the ticker from jittering. The rule applies to:

- Prices (V75 = `1,234.56`, EUR/USD = `1.0854`)
- Percentages (`+2.34%`, `-0.18%`)
- Timestamps (`14:23:07 EAT`)
- Durations (`02:34:11` for stream uptime)
- Viewer counts (`1,234` viewers)
- Subscriber counts (`12.3K` subs)
- Phone numbers, addresses, IDs

Use `font-mono tabular-nums` together. The `tabular-nums` ensures digits are equal-width within the mono font.

### Type scale

| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Hints, tooltips, timestamp suffixes |
| `text-sm` | 14px | Body, labels, secondary readouts |
| `text-base` | 16px | Console body text |
| `text-lg` | 18px | Console section headers |
| `text-xl` | 20px | Scene sub-titles |
| `text-2xl` | 24px | Console panel headers |
| `text-3xl` | 30px | Scene titles |
| `text-4xl` | 36px | Ticker symbols |
| `text-5xl` | 48px | Hero prices |
| `text-6xl` | 60px | Scene hero numbers |
| `text-7xl` | 72px | Off-air / starting-soon big text |
| `text-8xl` | 96px | W21 mark in scene corners |

### Letter-spacing + line-height
- Uppercase labels: `tracking-wider` (0.05em) — `LIVE`, `OFF AIR`, `STARTING SOON`.
- The W21 lockup channel name: `tracking-[0.15em]` (matches the mark's visual rhythm).
- Body: `tracking-normal`, `leading-relaxed`.
- Numeric readouts: `tracking-tight` (mono fonts benefit from tight tracking at large sizes).

---

## The Structural Grid (Brand Rule 6)

> **The grid never sleeps.** A faint structural grid is present in every composition — scenes, overlays, the console. It signals "this is a system, not a one-off."

### Implementation
The `bg-grid` utility class (defined in `tailwind.config.ts` + `globals.css`) paints a 32×32px grid at ~3% Grid White opacity:

```css
.bg-grid {
  background-image:
    linear-gradient(rgba(245, 245, 245, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 245, 245, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

The grid sits at the bottom of the z-stack on every scene root + the console root. It is always visible — never covered by a full-bleed panel.

For scenes that want a denser grid (e.g., a price-chart scene), use `bg-grid-dense` (16×16px). For scenes that want a sparser grid (e.g., an off-air interstitial), use `bg-grid-sparse` (64×64px). All three are defined in `tailwind.config.ts`.

---

## Scene Conventions

Every scene route under `src/app/scenes/*`:

1. **Root:** `<SceneFrame channel="...">` — fixes viewport at 1920×1080, `overflow: hidden`, `bg-grid` background, sets `--w21-active` to the channel color.
2. **W21 mark in the top-left** at 96px — via `<W21Mark channel={channel} size={96} />` placed absolutely at `top: 32px; left: 32px;`.
3. **Channel lockup** adjacent to the mark — `<W21Lockup channel={channel} size={96} />` (mark + pipe + channel name). The channel name is Grid White, uppercase, `tracking-[0.15em]`.
4. **Live indicator** (when applicable) — a small `LIVE` badge in the top-right, red dot pulsing, `tracking-wider`, mono.
5. **Clock + timezone** (when applicable) — mono, top-right, `EAT` / `UTC` suffix.
6. **Primary content area** — the center of the frame, the scene's main visual (chart, video placeholder, host camera frame, lesson title).
7. **Ticker** (when applicable) — bottom of the frame, full-width, mono, the channel color as the leading edge.
8. **Lower-third** (when applicable) — animated in via Framer Motion, 16:9 safe-area aware.
9. **Faint structural grid** — `bg-grid` on the root, always visible.
10. **No scrollbars, no overflow** — everything clips to 1920×1080.

### The 16:9 safe area
Design critical content (the W21 lockup, the host's face, the lesson title, the ticker text) within the inner 90% of the 1920×1080 frame — a 96px margin on all sides. The outer 96px is the "unsafe" area where OBS overlays (chat, alerts) might cover content.

---

## Overlay Conventions

Every overlay route under `src/app/overlays/*`:

1. **Transparent body** — `<html>` and `<body>` set to `background: transparent`. (Per-route layout or `<style>` tag.)
2. **Root:** `<OverlayFrame>` — 1920×1080 with `overflow: hidden` but no background. The structural grid is OPTIONAL on overlays (a ticker doesn't need it; a lower-third doesn't need it).
3. **Position** — the overlay's content is positioned absolutely where OBS expects it (e.g., the ticker at the bottom, the lower-third at the lower-third position).
4. **No W21 mark** — overlays are graphics layers, not scenes. The mark lives on the scene, not on every overlay. (Exception: a "scene bug" overlay in the top-right that shows the W21 lockup persistently — this is a future overlay route.)
5. **Animation** — Framer Motion in/out. Eases are documented below.
6. **OBS Custom CSS** — overlays rely on OBS's default Browser Source CSS (`body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }`). Do NOT override this; do NOT set a background on the overlay body.

---

## Console Conventions

The control console at `/`:

1. **Layout** — `ConsoleShell` with:
   - **Header** (sticky, 64px tall): W21 lockup (parent or active channel) + ChannelSelector + StreamHealth summary.
   - **Main** (flex-1): SceneSwitcherPanel (grid of cards) + TickerEditor (below the grid).
   - **Right rail** (320px, collapsible to a tab on narrow viewports): TallyIndicator + StreamHealthPanel + SchedulePanel.
2. **Hit targets** — minimum 44×44px (Apple HIG / Material Design). The console is "grandma-operable."
3. **State visibility** — the active channel, the active scene, the tally state, the stream status are always visible at a glance (header + right rail).
4. **Cards** — Zinc background, hairline Grid White border at 10% opacity, 8px radius. The card's accent (top stripe or left border) is the active channel color.
5. **Buttons** — primary = Grid White bg + Terminal Black text; secondary = transparent bg + Grid White border + Grid White text; destructive = Alert Magenta bg + Grid White text.
6. **Tooltips** — shadcn/ui Tooltip, dark variant, 200ms delay, used for icon-only buttons.
7. **Responsive** — desktop (1440px+) shows the full layout; tablet (768px+) collapses the right rail to a tab; mobile (future) is view-only.

### Animation eases (Framer Motion)

| Use | Ease | Duration |
|-----|------|----------|
| Tally flash (red→green) | `easeOut` | 150ms |
| Lower-third in | `[0.16, 1, 0.3, 1]` (custom ease-out-quint) | 400ms |
| Lower-third out | `easeIn` | 200ms |
| Alert overlay in | `[0.16, 1, 0.3, 1]` | 350ms |
| Alert overlay out | `easeIn` | 200ms |
| Scene card hover | `easeOut` | 100ms |
| Channel selector ring | `easeOut` | 150ms |

---

## What NEVER To Do

1. **Never modify `W21Mark.tsx`.** (Rule 2.)
2. **Never use indigo or blue as a decorative accent.** They are channel colors (Innovation, Education) — use them ONLY when rendering those channels.
3. **Never use a non-mono font for a numeric readout.** (Rule 5.)
4. **Never omit the structural grid from a scene.** (Rule 6.)
5. **Never set a background on an overlay body.** Overlays are transparent.
6. **Never hard-code a channel color.** Always `getChannel(channel).color` or `var(--w21-active)`.
7. **Never introduce a new color token without adding it to `channels.ts` + `IDENTITY_SYSTEM.md` + this doc.**
8. **Never use orange, green, red, amber as decorative accents** — they are channel colors (Culture/Agriculture/Politics/News) and semantic colors (bull/bear/alert). Use them only in those contexts.
9. **Never use VLM to assess design quality.** (See `AGENTS.md` Step 3.)
10. **Never hand-draw the W21 mark.** Always `<W21Mark />`.

---

## Accessibility (WCAG AA)

- **Contrast:** Grid White (#F5F5F5) on Terminal Black (#0A0A0A) = 18.7:1 (AAA). Channel colors on Terminal Black: Trading #00F0FF = 11.8:1 (AAA), News #FF8C00 = 8.4:1 (AAA), Politics #DC2626 = 5.2:1 (AA), Agriculture #22C55E = 7.3:1 (AAA), Innovation #6366F1 = 4.5:1 (AA — borderline, use for large text only), Education #3B82F6 = 4.5:1 (AA — borderline), Impact #F0EDE5 = 18.4:1 (AAA), Health #14B8A6 = 7.9:1 (AAA), Culture #F97316 = 8.4:1 (AAA), Sports #84CC16 = 11.5:1 (AAA), Tech #8B5CF6 = 5.1:1 (AA).
- **Focus rings:** 2px Grid White outline at 70% opacity on every interactive element, 2px offset.
- **Keyboard nav:** every console action is keyboard-reachable (Tab + Enter/Space; arrow keys on the scene switcher grid).
- **ARIA:** the tally indicator has `role="status"` + `aria-live="polite"`; the scene switcher has `role="radiogroup"`; the channel selector has `role="tablist"`.
- **Reduced motion:** Framer Motion respects `prefers-reduced-motion` — animations are disabled (instant transitions) when the user sets this preference.

---

*Next: [`06-SCENE_MODEL.md`](06-SCENE_MODEL.md) for the scene route spec.*
