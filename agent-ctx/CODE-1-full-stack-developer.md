# Agent Work Record — CODE-1

**Task ID:** CODE-1
**Agent:** full-stack-developer
**Task:** Build W21 identity system + trading-live scene + control panel

---

## Work Log

### 1. Foundation
- Ran `curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash` to initialize the fullstack environment.
- Read existing `globals.css`, `layout.tsx`, `page.tsx`, `package.json`, `card.tsx`, `button.tsx`, and `utils.ts` to understand the shadcn/ui + Tailwind 4 baseline.
- Confirmed dev server running on port 3000 (both `/` and `/scenes/trading-live` respond 200).

### 2. Design Tokens (`src/app/globals.css`)
- Added W21 system tokens to the existing `@theme inline` block (Terminal Black, Grid White, Zinc, Alert Magenta, Bull, Bear).
- Added 12 channel color tokens (`--color-ch-parent` through `--color-ch-tech`) so channel colors work as Tailwind utilities (e.g. `bg-ch-trading`, `text-ch-parent`).
- Repurposed `--font-mono` to point at `--font-jetbrains-mono`.
- Replaced `.dark` palette with W21 channel + system palette (Terminal Black background, Grid White text, Zinc panels).
- Added utility classes:
  - `.w21-grid` / `.w21-grid-dense` — faint structural grid (Rule 6)
  - `.w21-crosshairs` — radial `+` markers at intersections
  - `.w21-scanlines` — 2% CRT scan-line veil
  - `.w21-noise` — 2% SVG noise grain
  - `.w21-led` — pulsing LED glow animation
  - `.w21-blink` — slow ambient blink
  - `.w21-ticker-track` / `.w21-ticker-wrap` — infinite scroll marquee
  - `.w21-caret` — terminal cursor blink
  - `.w21-scroll` — custom thin scrollbar
  - `.w21-scene-root` — 1920×1080 fixed-dimension scene viewport for OBS

### 3. Layout (`src/app/layout.tsx`)
- Replaced `Geist_Mono` with `JetBrains_Mono` (weights 400/500/700/800).
- Added `className="dark"` to `<html>` so the dark theme is the default.
- Updated metadata: title `"Smile Live Kit — W21 Broadcast Console"`, W21 keywords, `/logo.svg` icon.

### 4. Channel Config (`src/lib/w21/channels.ts`)
- Exported `channels` map (the exact brief spec) with full typing.
- Added `ChannelKey` union, `ChannelConfig` interface, `w21System` palette, `getChannel()`, and `channelKeys[]` helpers.
- Used `satisfies Record<ChannelKey, ChannelConfig>` so the map is exhaustive and typed.

### 5. W21 Components (`src/components/w21/`)
- **`W21Mark.tsx`** — the SACRED universal mark. Pixel-perfect: square = `size×size`, radius ≈ 11%, border ≈ 4.5% Grid White at 65% opacity, JetBrains Mono Bold "W21" at 42% of size positioned right-of-center, status dot ≈ 6% of size sitting left-of-text with soft radial glow (`.w21-led`). Channel color drives the dot + glow only — proportions never change.
- **`W21Lockup.tsx`** — `[mark] | [channel name]` horizontal lockup. Pipe is `1.5–2px` wide, height ≈ 65% of square, in the channel color with a soft glow. Channel name is ALWAYS Grid White (Rule 3), JetBrains Mono Medium, wide tracking (0.18em default).
- **`SignalCard.tsx`** — trading signal card. BUY → 3px Harvest Green left border, SELL → 3px Sovereign Crimson left border. Monospaced levels (ENTRY/SL/TP), optional confidence bar, optional strategy tag. Zinc background.
- **`Ticker.tsx`** — infinite-scroll price ticker. Green ▲ / Red ▼ arrows, monospaced, CSS animation, seamless loop via duplicate list.
- **`index.ts`** — barrel file with single import surface.

### 6. Hero Scene (`src/app/scenes/trading-live/page.tsx`)
Renders EXACTLY 1920×1080 via `.w21-scene-root`. Absolute-positioned pixel-perfect layout:
- **Background:** Terminal Black + faint 12-column grid (5% opacity) + horizontal gridlines (5%) + radial cross-hair markers (7%) + scan lines (2%) + noise grain (2%).
- **Top bar (y=0, h=36):** W21Mark(22px, trading) left · centered `"LONDON SESSION — LIVE ANALYSIS"` · elapsed time + pulsing cyan LED right.
- **Chart area (x=24, y=56, 1640×640):** 1px zinc border + gold L-corner brackets. Header: `"EUR/USD — H4"` + LIVE indicator + bid/ask + cyan timestamp. Body: subtle placeholder candlestick series (35 deterministic candles, bull green / bear red, gridlines). Bottom: price scale ruler.
- **Signal panel (x=1684, y=56, 212×924):** Zinc background, header `"SIGNALS (3)"` (cyan + gold count), 3 stacked SignalCards (EUR/USD BUY, GBP/JPY SELL, XAU/USD BUY), activity log at bottom with timestamped events.
- **Webcam zone (x=24, y=716, 420×240):** 1px cyan border + cyan L-corner brackets. `"CAM—01"` label with pulsing dot (top-left), blinking `"REC"` indicator (top-right), inner camera crosshair, bottom info strip with resolution + clock.
- **Session/Risk panel (x=460, y=716, 1204×240):** Fills the space between webcam and signal panel. Gold corner brackets. Four sections: SESSION P&L (+$2,481.55, green) · OPEN RISK (1.8%, gold) · DAILY RANGE · WATCHLIST (6 pairs grid).
- **Lower bar (y=1023, h=55):** Zinc background. Left: W21Lockup(32px, trading). Center: scrolling Ticker. Right: live cyan clock + EAT label + LED.
- **Bottom edge (y=1078, h=2):** Full-width signal cyan stripe with glow.

### 7. Control Panel (`src/app/page.tsx`)
Grandma-operable console, terminal-grade styling:
- **Header:** W21Lockup(parent, 36px, gold) + `"SMILE LIVE KIT — BROADCAST CONSOLE"` title + ON AIR/STANDBY status badge + DEV badge + date.
- **Left column (320px, ~27%):** ScrollArea scene list. 7 scenes (Starting Soon, Trading Live, Break, News, Interview, Education, Ending). Each card: channel accent left stripe + W21Mark + title + StatusPill (LIVE/READY/SOON) + tagline. Only Trading Live has a route.
- **Right column (~73%):** Live preview iframe (1920×1080 scaled via CSS transform with ResizeObserver auto-fit) inside a 16:9 viewport. Header strip with mark + title + LIVE PREVIEW badge. Bottom strip with scale % + clock. Below: OBS URL hint bar with Copy button + Open Fullscreen link.
- **Footer (sticky via `mt-auto`):** Go Live/Stop toggle (green/red), Stop, Refresh Scene buttons. Clock + EAT + W21Mark(parent).

### 8. Hooks
- Created `src/hooks/use-clock.ts` — `useClock()` built on `useSyncExternalStore`. SSR-safe (returns `null` on server), ticks every `intervalMs`. Used by both the control panel and the scene to avoid the `react-hooks/set-state-in-effect` lint rule.

### 9. Verification
- `bun run lint` — **0 errors, 0 warnings**.
- `curl http://localhost:3000/` → 200.
- `curl http://localhost:3000/scenes/trading-live` → 200.
- Confirmed SSR output contains expected content (`London Session — Live Analysis`, `EUR/USD`, `Smile Live Kit`, `Broadcast Console`, `WORLD 21`, `Starting Soon`, `Go Live`).
- Dev log shows no compile or runtime errors after the rebuild.

---

## Stage Summary

### Files created
- `src/lib/w21/channels.ts` — channel config + system palette
- `src/components/w21/W21Mark.tsx` — sacred universal mark
- `src/components/w21/W21Lockup.tsx` — full horizontal lockup
- `src/components/w21/SignalCard.tsx` — buy/sell signal card
- `src/components/w21/Ticker.tsx` — scrolling price ticker
- `src/components/w21/index.ts` — barrel export
- `src/app/scenes/trading-live/page.tsx` — 1920×1080 hero scene (Prompt 07)
- `src/hooks/use-clock.ts` — SSR-safe ticking clock hook

### Files modified
- `src/app/globals.css` — W21 tokens + utility classes
- `src/app/layout.tsx` — JetBrains Mono, dark default, W21 metadata
- `src/app/page.tsx` — broadcast console control panel

### What the next agent should know
1. **W21 component barrel:** `import { W21Mark, W21Lockup, SignalCard, Ticker } from "@/components/w21"`. Types are also exported (`W21MarkProps`, `SignalCardProps`, `TickerProps`, etc.).
2. **Channel color CSS utilities** are available as `bg-ch-{channel}`, `text-ch-{channel}`, `border-ch-{channel}` (e.g. `text-ch-trading`). Use these for channel-specific accents instead of hardcoded hex.
3. **Scene template:** Every scene page should render a single `<div className="w21-scene-root ...">` wrapper sized 1920×1080 with `overflow: hidden`. Use absolute positioning inside for pixel-perfect layout. Mock data goes at the top of the file; real data feeds will swap in later.
4. **Clock pattern:** Use `useClock()` from `@/hooks/use-clock` — do NOT use `useState(new Date()) + useEffect(setInterval)` because the `react-hooks/set-state-in-effect` rule will fail lint. The hook returns `Date | null` (null on server / first render) so always guard with `now ? fmt(now) : "--:--:--"`.
5. **Control panel scene registry:** `SCENES` array in `src/app/page.tsx` is the single source of truth for which scenes appear in the console. To wire up a newly built scene, add `{ id, title, channel, route: "/scenes/...", status: "live" }` to that array. Unrouted scenes show a tasteful "Coming soon" placeholder.
6. **Iframe preview** uses CSS `transform: scale()` on a 1920×1080 iframe inside a ResizeObserver-tracked wrapper. The scale auto-fits any container.
7. **OBS Browser Source URL** for any scene is `http://localhost:3000/scenes/{scene-id}`. The control panel shows this URL with a Copy button.
8. **Lint is strict:** `bun run lint` runs `eslint .` with the Next.js + react-hooks rules. Avoid `setState` synchronously inside `useEffect` bodies — use `useSyncExternalStore`, `requestAnimationFrame`, or interval callbacks instead.
9. **Pending scenes (next milestones):** Starting Soon, Break/BRB, News, Interview, Education, Ending. Each should get its own route under `src/app/scenes/{kebab-id}/page.tsx` using the W21 kit + a relevant channel accent.
10. **Real data feeds:** Trading scene currently uses mock SIGNALS + TICKER_ITEMS arrays. When wiring real feeds, replace these with TanStack Query / SSE / WebSocket subscriptions — keep the prop shape the same so the components don't need to change.
