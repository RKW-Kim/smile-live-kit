# IDENTITY_SYSTEM — The W21 Brand Bible

> **This document is the canonical specification of the World 21 (W21) identity system.** It is the brand bible. Every component in `src/components/w21/` implements this spec. Every scene, overlay, and console surface applies it. **Read this end-to-end before touching anything in `src/components/w21/` or before designing any visual surface in Smile Live Kit.**
>
> Parent brand: **smile.co.ke**. The W21 ecosystem is a multi-channel media network. Smile Live Kit is the broadcast-graphics layer that enforces the W21 identity on-air.

---

## 1. The Universal Mark

### Definition
The W21 universal mark is a **rounded square containing the text "W21" and a single colored status dot**. It is the only mark used across the entire W21 ecosystem. It never changes from channel to channel; only the status dot's color changes.

### Construction
The mark is rendered by `src/components/w21/W21Mark.tsx`. The spec (relative to `size`, the square's outer width):

| Element | Spec | Why |
|---------|------|-----|
| Square | `size × size`, radius ≈ 11% of width | The rounded square is the vessel. The 11% radius gives the institutional-but-approachable feel — not a sharp rectangle (too corporate), not a circle (too playful). |
| Border | Grid White `#F5F5F5` at ~65% opacity, weight ≈ 4.5% of size (~2.5px at 48px) | Hairline Grid White border. The opacity softens the mark against dark backgrounds; the weight ensures it reads at small sizes (24px favicon) and large (96px scene corner). |
| Fill | Terminal Black `#0A0A0A` | The mark sits on a Terminal Black background. The fill matches the page background — the mark's interior is "empty space" that the border defines. |
| "W21" text | JetBrains Mono Bold, glyph height ≈ 62% of size, centered horizontally, nudged ~1.5% up vertically (optical baseline correction) | The mono typeface signals data, terminal, precision. The 62% glyph height fills the square without crowding the border. The nudge accounts for the visual weight of the "W" (heavier than "1"). |
| Text color | Grid White `#F5F5F5` | The text is part of the mark, not a label. It's white, always. |
| Status dot | Diameter ≈ 6% of size, positioned left of "W", vertically centered | The dot sits to the left of the "W" — it's the "status indicator" of the channel, like a power LED on a piece of equipment. |
| Dot color | The channel's signature color (the ONLY variable) | This is how viewers know which channel they're watching. |
| Dot glow | Soft radial glow at ~16% of size, in the channel color | The glow gives the dot a "live" feel — like an LED. It signals "this channel is on-air." |

### What NEVER changes
- The square's proportions (1:1, 11% radius).
- The border weight, color, opacity.
- The fill color (Terminal Black).
- The "W21" text content, typeface (JetBrains Mono Bold), color (Grid White), and position.
- The status dot's size, position (left of "W", vertically centered), and glow radius.

### What changes
- The status dot's fill color + glow shadow color — sourced from `src/lib/w21/channels.ts` based on the `channel` prop.

### The rule (Rule 2 in `AGENTS.md`)
**The mark is sacred.** `W21Mark.tsx` is read-only. Do NOT modify, refactor, or "improve" it. Do NOT change its typeface, proportions, border, fill, or dot position. Bugs in the mark go in `docs/handoff/12-KNOWN_ISSUES.md`, not in local patches. The mark is a design contract, not a code artifact.

---

## 2. The Lockup

### Definition
The W21 lockup is the horizontal composition of: **the mark + a vertical pipe divider + the channel name**. It is the canonical "channel identification" used in scene corners, console headers, watermarks, and banners.

### Construction
The lockup is rendered by `src/components/w21/W21Lockup.tsx`. The spec:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ●W21  │  TRADING                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Mark | `<W21Mark channel={channel} size={size} />` — typically 48px (console header) or 96px (scene corner). |
| Gap | 8px (or `size * 0.16`) between the mark and the pipe. |
| Pipe | 3px wide vertical bar, height ≈ 80% of the mark height, in the channel's signature color. Radius 2px. |
| Gap | 16px (or `size * 0.33`) between the pipe and the channel name. |
| Channel name | JetBrains Mono Bold, size ≈ 33-50% of the mark size, Grid White `#F5F5F5`, uppercase, `letter-spacing: 0.15em`, vertically centered. |

### The pipe color (Rule 2 — color is the differentiator)
The pipe takes the channel's signature color — the same color as the status dot. The channel name stays white.

### The channel name (Rule 3 — channel name stays white)
The channel name is ALWAYS Grid White `#F5F5F5`. It is never the channel color. This is non-negotiable. The channel color belongs to the dot + the pipe; the name belongs to the system. This is what makes the system recognizable across channels — the white name + the colored pipe + the colored dot.

### The parent lockup
For parent-brand contexts (the smile.co.ke master mark, the W21 ecosystem lockup), the channel is `"parent"`:
- Mark: `<W21Mark channel="parent" size={size} />` — dot + glow in Unity Gold #F5A623.
- Pipe: Unity Gold.
- Name: `"WORLD 21"` (uppercase, mono, Grid White).

---

## 3. The 6 Brand Rules

These are non-negotiable. They are encoded as TypeScript + Tailwind conventions in Smile Live Kit.

### Rule 1 — The mark is sacred.
Never modify `W21Mark.tsx`. The proportions, border, type, dot position, and fill are locked. The ONLY variable is color.

### Rule 2 — Color is the differentiator.
The status dot + the pipe divider change to the channel's signature color. That is how viewers know which channel they're watching. No other element recolors — the channel name stays white, the structural grid stays faint Grid White, the system colors (Terminal Black, Grid White, Zinc, Alert Magenta) are constant.

### Rule 3 — The channel name stays white.
Grid White `#F5F5F5`. Always. The channel color belongs to the dot + the pipe; the name belongs to the system. This is the recognition anchor — viewers see the white name + the colored pipe and instantly know "this is W21 [channel name]."

### Rule 4 — Gold is the parent color.
Unity Gold `#F5A623` is the parent brand color (smile.co.ke / World 21). It appears ONLY on parent-brand surfaces — the parent lockup, the smile.co.ke master mark, ecosystem-level announcements. It NEVER appears on a channel scene as a decorative accent. (Gold is the parent's signature color, the same way cyan is Trading's signature color.)

### Rule 5 — Numbers are always monospaced.
Every numeric readout — prices, percentages, timestamps, durations, viewer counts, subscriber counts — uses JetBrains Mono with `tabular-nums`. This is functional, not aesthetic: monospaced digits don't shift column width as values change, preventing the ticker from jittering and the price readout from reflowing.

### Rule 6 — The grid never sleeps.
A faint structural grid is present in every scene composition. It signals "this is a system, not a one-off." The grid is Grid White at ~3% opacity, 32×32px squares, painted at the bottom of the z-stack. It is always visible — never covered by a full-bleed panel.

---

## 4. The Channel Color Map

The single source of truth is `src/lib/w21/channels.ts`. This document mirrors it for reference.

| Channel | Color name | Hex | Status | Notes |
|---------|------------|-----|--------|-------|
| World 21 (parent) | Unity Gold | `#F5A623` | Active (parent brand) | The smile.co.ke master color. Appears only on parent-brand surfaces. |
| Trading | Signal Cyan | `#00F0FF` | **LAUNCH FIRST** | The first channel. 24/7 trading education. |
| News | Press Amber | `#FF8C00` | Phase 3 | News + breaking-news vertical. |
| Politics | Sovereign Crimson | `#DC2626` | Future | Politics + debates vertical. |
| Agriculture | Harvest Green | `#22C55E` | Future | Agriculture + commodity-market vertical. |
| Innovation | Electric Indigo | `#6366F1` | Future | Innovation + startups vertical. |
| Impact | Warm White | `#F0EDE5` | Future | Social-impact vertical. The only "light" channel color — used carefully for contrast. |
| Health | Healing Teal | `#14B8A6` | Future | Health + wellness vertical. |
| Education | Knowledge Blue | `#3B82F6` | Future | Education vertical (separate from the W21 Trading curriculum). |
| Culture | Sunset Coral | `#F97316` | Future | Culture + arts vertical. |
| Sports | Victory Lime | `#84CC16` | Future | Sports vertical. |
| Tech | Plasma Violet | `#8B5CF6` | Future | Technology vertical. |

### The hard rule
Indigo `#6366F1` and Blue `#3B82F6` are channel colors (Innovation, Education). They appear ONLY when rendering those channels' identity. **Never** use indigo or blue as decorative accents in the console, in a non-Innovation/Education scene, or in a generic UI element. Generic UI accents use the active channel's color, or Grid White / Zinc for neutral surfaces.

---

## 5. The System Colors

The structural palette — constant across every channel, every scene, every console surface.

| Token | Hex | Role |
|-------|-----|------|
| Terminal Black | `#0A0A0A` | Page background. The mark's fill. The base of every composition. |
| Grid White | `#F5F5F5` | Primary text. The mark's border + text. The channel name. Default button text. The structural grid. |
| Zinc | `#27272A` | Panels. Card backgrounds. Dividers. The "second-level" surface — one step above Terminal Black. |
| Alert Magenta | `#FF006E` | Alerts. Breaking news. Error states. Destructive CTAs. The "this needs attention" color. |
| Bull Green | `#22C55E` | Market up. (Same hex as Agriculture channel — semantic alignment, not a conflict.) |
| Bear Red | `#DC2626` | Market down. (Same hex as Politics channel — semantic alignment.) |

### Why these colors
- **Terminal Black** (not pure black `#000000`) — pure black is too harsh on emissive displays (OLED, AMOLED). Terminal Black is the deepest neutral that still has a hint of warmth.
- **Grid White** (not pure white `#FFFFFF`) — pure white at full intensity is glaring against Terminal Black. Grid White is 96% white — just enough softening to be readable for hours without eye strain.
- **Zinc** (not gray) — Zinc has a slight blue undertone that pairs well with cyan (Trading's color). Pure gray would feel dead.
- **Alert Magenta** — chosen for maximum visibility against the dark palette. It's the only "loud" color in the system, reserved for genuine alerts.

---

## 6. Typography

### Fonts
- **JetBrains Mono** — every numeric readout, the W21 mark text, the channel name in the lockup, timestamps, prices, percentages, code. Variable weights: 400 (regular), 500 (medium), 700 (bold), 800 (extra bold — used in the mark).
- **Geist Sans** — body text, headings, UI labels, scene titles, console panel headers. Variable font (no weight files needed).

### Why these two
- **JetBrains Mono** — designed for developers reading code. The digits are clear, distinct (no confusion between `0` and `O`, `1` and `l`, `5` and `S`), and the `tabular-nums` feature ensures equal-width columns. The terminal/IDE aesthetic reinforces the "institutional data" feel of the brand.
- **Geist Sans** — Vercel's open-source sans, designed for modern UI. Clean, geometric, neutral. Doesn't compete with the mono for attention.

### The mono rule (Rule 5) — what counts as a "numeric readout"
- Prices (`1,234.56`)
- Percentages (`+2.34%`)
- Timestamps (`14:23:07 EAT`)
- Durations (`02:34:11` uptime)
- Viewer counts (`1,234`)
- Subscriber counts (`12.3K`)
- Phone numbers, addresses, IDs
- The "W21" text inside the mark
- The channel name in the lockup (it's a label, not body text — mono gives it the institutional feel)

### Type scale (Tailwind tokens)

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

### Letter-spacing
- Uppercase labels (LIVE, OFF AIR, STARTING SOON): `tracking-wider` (0.05em).
- The W21 lockup channel name: `tracking-[0.15em]`.
- Body text: `tracking-normal`.
- Large numeric readouts (≥48px): `tracking-tight` (mono fonts benefit from tight tracking at large sizes).

---

## 7. The Structural Grid (Rule 6)

### Definition
Every W21 composition has a faint structural grid at the bottom of the z-stack. It signals "this is a system, not a one-off."

### Implementation
The `bg-grid` utility class (in `tailwind.config.ts` + `globals.css`):

```css
.bg-grid {
  background-image:
    linear-gradient(rgba(245, 245, 245, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 245, 245, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

Three variants:
- `bg-grid` (default) — 32×32px grid at 3% Grid White opacity.
- `bg-grid-dense` — 16×16px grid at 3% opacity. For price-chart scenes.
- `bg-grid-sparse` — 64×64px grid at 3% opacity. For off-air / interstitial scenes.

### Where it appears
- Every scene root (mandatory).
- The console root (mandatory).
- NOT on overlays (overlays are graphics layers — the grid would compete with the underlying OBS canvas).

### Where it does NOT appear
- Overlays (ticker, lower-third, alert).
- Modal dialogs (they sit above the grid).
- Dropdown menus, popovers, tooltips.

---

## 8. Usage Examples

### The favicon
A 32×32px W21 mark in the active channel color. For the production site (`smile-live-kit.vercel.app`), the favicon is the Trading-cyan mark. For per-channel deployments (future), the favicon matches the channel.

### The watermark
A 96×96px W21 mark at 30% opacity, placed in the bottom-right of a scene, rotated 0° (no rotation — the mark is always axis-aligned). Used for "scene bug" overlays on rebroadcasts.

### The stream overlay
The lockup (mark + pipe + channel name) in the top-left of every scene at 96px mark size, 32px from the top and left edges. The Live badge + clock in the top-right. The ticker at the bottom. The structural grid on the root.

### The banner (for YouTube thumbnails, social posts)
A 1280×720px composition: Terminal Black background, structural grid, the W21 lockup centered (mark at 192px), the channel color as a thin top stripe (4px) + a thin bottom stripe (4px), the video title below the lockup in Geist Sans Bold.

### The console header
The W21 lockup (mark at 48px) in the top-left of the console header. The ChannelSelector (12 channel buttons + parent) in the center. The StreamHealth summary + Settings button in the top-right.

---

## 9. What NEVER To Do

1. **Never modify `W21Mark.tsx`.** (Rule 1 + Rule 2 in `AGENTS.md`.)
2. **Never change the mark's proportions, border, type, dot position, or fill.** (Rule 1.)
3. **Never recolor the channel name.** It stays Grid White. (Rule 3.)
4. **Never use a non-mono font for a numeric readout.** (Rule 5.)
5. **Never omit the structural grid from a scene.** (Rule 6.)
6. **Never use Gold `#F5A623` as a channel-scene accent.** Gold is the parent color. (Rule 4.)
7. **Never use indigo or blue as decorative accents.** They are channel colors (Innovation, Education). Use them ONLY when rendering those channels.
8. **Never hard-code a channel color.** Always `getChannel(channel).color` or `var(--w21-active)`.
9. **Never hand-draw the W21 mark.** Always `<W21Mark />`.
10. **Never introduce a new color token without adding it to `channels.ts` + this doc + `docs/handoff/05-DESIGN_SYSTEM.md`.**
11. **Never use orange, green, red, amber, teal, coral, lime, violet as decorative accents** — they are channel colors (Culture, Agriculture, Politics, News, Health, Sports, Tech). Use them only in those channel contexts.
12. **Never use VLM to assess brand compliance.** VLM cannot judge color, spacing, or hierarchy. Use code analysis — verify the components used, the colors sourced, the typography applied.

---

## 10. Accessibility (WCAG AA)

### Contrast ratios (channel colors on Terminal Black `#0A0A0A`)

| Channel | Hex | Contrast vs Terminal Black | WCAG |
|---------|-----|----------------------------|------|
| Parent (Gold) | `#F5A623` | 11.0:1 | AAA |
| Trading (Cyan) | `#00F0FF` | 11.8:1 | AAA |
| News (Amber) | `#FF8C00` | 8.4:1 | AAA |
| Politics (Crimson) | `#DC2626` | 5.2:1 | AA |
| Agriculture (Green) | `#22C55E` | 7.3:1 | AAA |
| Innovation (Indigo) | `#6366F1` | 4.5:1 | AA (borderline — use for large text only) |
| Impact (Warm White) | `#F0EDE5` | 18.4:1 | AAA |
| Health (Teal) | `#14B8A6` | 7.9:1 | AAA |
| Education (Blue) | `#3B82F6` | 4.5:1 | AA (borderline — use for large text only) |
| Culture (Coral) | `#F97316` | 8.4:1 | AAA |
| Sports (Lime) | `#84CC16` | 11.5:1 | AAA |
| Tech (Violet) | `#8B5CF6` | 5.1:1 | AA |

Grid White `#F5F5F5` on Terminal Black `#0A0A0A` = 18.7:1 (AAA).

### Innovation + Education: the borderline cases
Innovation Indigo and Education Blue hit exactly 4.5:1 — the WCAG AA threshold for normal text. For these two channels:
- Use the channel color for large text (≥24px) and UI elements (borders, dots, pipes) — passes AA.
- For small text (≤18px) in the channel color, use the channel color at 100% opacity on Terminal Black, but verify with a contrast checker. If borderline, darken slightly (e.g., Innovation at `#5457E5` instead of `#6366F1` for small text).
- The channel name in the lockup is always Grid White — it's not affected.

### Focus rings
Every interactive element has a 2px Grid White outline at 70% opacity, 2px offset. The focus ring is visible on every channel color.

### Reduced motion
The W21 mark's status dot has a soft pulsing glow by default. When `prefers-reduced-motion: reduce` is set, the pulse is disabled (the glow is static). Framer Motion respects this globally.

---

## 11. Implementation Reference

### Files
- `src/lib/w21/channels.ts` — the channel color map + system colors + `getChannel()` helper.
- `src/components/w21/W21Mark.tsx` — the universal mark (SACRED — Rule 2).
- `src/components/w21/W21Lockup.tsx` — the lockup (mark + pipe + channel name).
- `src/app/globals.css` — the CSS variables (`--w21-terminal`, `--w21-grid-white`, `--w21-zinc`, `--w21-alert`, `--w21-<channel>` for each channel, `--w21-active` set by the ChannelSelector).
- `tailwind.config.ts` — the `bg-grid` / `bg-grid-dense` / `bg-grid-sparse` utilities.

### The CSS variable strategy
The active channel color is exposed as `var(--w21-active)` on the console root + every scene root. This lets every component reference the "current channel" accent without prop-drilling:

```css
/* Set by ChannelSelector on the console root */
html[data-channel="trading"] {
  --w21-active: var(--w21-trading);
}
html[data-channel="news"] {
  --w21-active: var(--w21-news);
}
/* ... etc */
```

Components use `color: var(--w21-active)` or `border-color: var(--w21-active)` for the chromatic accent. When the operator switches channels, the entire console recolors instantly.

### Adding a new channel
1. Add an entry to `src/lib/w21/channels.ts`:
   ```ts
   newchannel: { name: "NEWCHANNEL", color: "#XXXXXX", label: "Color Name" },
   ```
2. Add the CSS variable to `src/app/globals.css`:
   ```css
   --w21-newchannel: #XXXXXX;
   ```
3. Add the `html[data-channel="newchannel"]` rule.
4. Add the channel to the table in this doc (§4).
5. Add the channel to the contrast table (§10).
6. Add the channel button to the console's `ChannelSelector` (it auto-derives from `channelKeys`, so no manual addition — but verify).
7. Add the channel to the features doc (`docs/handoff/09-FEATURES.md`) if it warrants new scene routes.

---

*This document is the brand bible. The mark is sacred. The rules are non-negotiable. The next AI reads this end-to-end before touching anything in `src/components/w21/`.*
