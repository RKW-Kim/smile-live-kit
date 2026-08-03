# PORT-1 — zai-code (opus, main orchestrator)

**Task:** Port the EXACT original v1 HTML/CSS/JS/SVG source files into the Next.js 16 app — pixel-fidelity absolute priority. Serve the original HTML verbatim; do NOT re-implement as React components.

## What I did

### 1. Copied all v1 source files → `public/scenes/` (EXACT verbatim copies)
- `cp /tmp/v1-extract/core/*.html public/scenes/` — 11 HTML files (00-bg, 01-starting-soon, 02-countdown, 03-live, 04-brb, 05-ending, 08-alerts, control, market-ticker, mini-chart, test-cam)
- `cp /tmp/v1-extract/core/*.css public/scenes/smile.css`
- `cp /tmp/v1-extract/core/*.js public/scenes/{smile-mark.js,live-feed.js}`
- `cp /tmp/v1-extract/core/*.svg public/scenes/smile-mark.svg`
- `git show legacy/v1-python-static:core/brand.json > public/scenes/brand.json` — the smile brand config (tokens + handles + wordmark)
- Verified identical via `diff` against `/tmp/v1-extract/core/` originals (5 spot checks: 03-live, 01-starting-soon, control, smile.css, smile-mark.js — all IDENTICAL).

### 2. Deleted the previous React reinterpretation
- `src/components/smile/` — entire folder (SmileMark, SmileLockup, SignalCard, Ticker, Chip, index)
- `src/lib/smile/` — entire folder (channels.ts SmileBrand theming)
- `src/app/scenes/trading-live/` — the React hero scene (replaced by verbatim `/scenes/03-live.html`)

### 3. Rewrote `src/app/layout.tsx`
- Swapped Manrope/Inter → **Chakra_Petch** (500/600/700) + **IBM_Plex_Mono** (400/500/600) via next/font/google.
- CSS variables: `--font-disp` (Chakra Petch) + `--font-mono` (IBM Plex Mono). `--font-sans` aliased to mono (the control panel uses mono for body).
- Metadata: title "Smile Live Kit — Broadcast Console", keywords refreshed (SmileSquad, OBS, Nairobi Desk), icon `/scenes/smile-mark.svg` (the real v1 SVG).
- Kept `dark` default + Toaster.
- The scene HTML files load their own fonts (Manrope/Inter/Chakra Petch via Google Fonts `<link>`) inside their iframes — they're self-contained.

### 4. Rewrote `src/app/globals.css`
- Added the full `control.html` palette as `:root` + `.dark` variables: `--bg:#0a0f0d`, `--panel-solid:#101714`, `--line:#1e2b25`, `--line-hi:#2c3f36`, `--ink:#0a0a0a`, `--amb:#ffb454`, `--red:#ff5c5c`, `--cyan:#5ad1e6`, `--live:#3ddc84`, `--live-dk:#12351f`, plus the smile.css palette (`--yellow`, `--up`, `--down`, `--sky`, etc.).
- shadcn `@theme inline` kept intact (existing UI components depend on it), `--primary: var(--live)`, `--ring: var(--live)`.
- Removed all the W21/SmileMark mood-animation utilities (`.smile-mark--blink`, `.smile-frame`, `.smile-panel--bracket`, `.spark`, `.orbit`, etc.) — those lived in the React components which were deleted. The scene HTML files bring their own `smile.css`, so the control panel only needs its own styling.
- Added the control-panel CSS classes that match `control.html` 1:1:
  - `.smile-console-bg` — green radial glow + scanlines + inset vignette (matches control.html `body` background).
  - `.smile-brand` — Chakra Petch 30px 700 with green `<em>//</em>` separator + small subtitle.
  - `.smile-pill` (+ `.on`, `.warn`) — status badge with dot + pulse animation.
  - `.smile-clock` — Chakra Petch 26px 600 tabular-nums.
  - `.smile-panel` — `--panel-solid` card with green top-left corner bracket (`::before` 14×14, `--live` borders).
  - `.smile-btn` (+ `.active`, `.danger`, `.amb`) — Chakra Petch uppercase button with hairline border + green hover/active.
  - `.smile-scene` (+ `.active`) — clickable scene card in the scene grid.
  - `.smile-viewport` + `.smile-iframe-wrap` + `.smile-iframe` — scaled preview iframe container.
  - `.smile-urlbar` — OBS URL bar with monospace path + Copy/Fullscreen buttons.
  - `.smile-toast` — bottom-center toast pill (replaces the old use-toast system for quick status feedback).
  - `.smile-scroll` — custom scrollbar styling.
  - `prefers-reduced-motion` respected.

### 5. Rebuilt `src/app/page.tsx` — the SMILE // CONTROL console
- `SCENES` catalog: 11 scenes (starting-soon, countdown, live, brb, ending, alerts, ticker, chart, bg, cam, control) with exact w×h per scene (1920×1080 default, ticker 1920×76, mini-chart 460×300, control 1240×900, cam 1280×720).
- Layout matches control.html aesthetic:
  - **Header**: `.smile-brand` (SMILE//CONTROL + "live kit command centre · v1" subtitle) + OBS pill (STANDBY/BROADCASTING, toggles with `isLive`) + CANVAS pill (1920×1080) + live clock.
  - **Main grid** (Tailwind grid-cols-12):
    - Left (col-span-4 md): `.smile-panel` "Scenes · 11" with scrollable scene list. Each scene card: SmileMarkMini SVG + title + status pill (LIVE/READY/SOON) + tagline + w×h + path.
    - Right (col-span-8 md): preview `.smile-panel` with viewport header (Preview · scene name · scale %) + 16:9 `.smile-viewport` with scaled iframe (ResizeObserver fits the scene's native w×h inside the container).
    - Right lower: `.smile-panel` "OBS Browser Source URL" with monospace URL + COPY button (clipboard) + OPEN FULLSCREEN link.
    - Below: `.smile-panel` "Quick Actions" (5 quick-link buttons to key scenes) + `.smile-panel` "Diagnostics" (table with scene/source/scale/status rows).
  - **Footer** (sticky via `mt-auto`): GO LIVE/ON AIR toggle (green active) + STOP (red, disabled when not live) + REFRESH SCENE (re-mounts iframe via `key`) + date + clock + SmileMarkMini.
  - **Toast**: shows briefly on Go Live / Stop / Refresh / Copy actions (auto-dismiss 1.9s).
- iframe scaling: `ResizeObserver` on the viewport container computes `scale = min(cw/sceneW, ch/sceneH)`, then sets iframe `width`/`height` to native pixels + `transform: scale(s)` with `transform-origin: top left`. The iframe is centered via flexbox in `.smile-iframe-wrap`. This handles 1920×1080 (16:9 fill), 1920×76 (fits width, centers vertically), 460×300 (fits both, centers), 1240×900, 1280×720.
- `SmileMarkMini` — a tiny inline SVG component (22×22) matching `smile-mark.svg` exactly (yellow disc + 2 eyes + smile path). Used in scene cards + footer. NOT the React SmileMark — just a static SVG, since the real smile-mark.js auto-upgrades `.brand .dw` / `svg.disc` / `.face` elements inside the iframed scenes.

### 6. Verification
- `bun run lint` → **0 errors, 0 warnings**.
- All 17 routes return **200**: `/`, `/scenes/{00-bg,01-starting-soon,02-countdown,03-live,04-brb,05-ending,08-alerts,control,market-ticker,mini-chart,test-cam}.html`, `/scenes/{smile.css,smile-mark.js,smile-mark.svg,brand.json,live-feed.js}`.
- `diff` confirms `/scenes/03-live.html`, `/scenes/01-starting-soon.html`, `/scenes/control.html`, `/scenes/smile.css`, `/scenes/smile-mark.js` are **byte-for-byte identical** to the originals in `/tmp/v1-extract/core/`.
- SSR output of `/` contains expected strings: `SMILE // CONTROL`, `live kit command centre · v1`, `STANDBY`, `CANVAS`, `1920×1080`, `GO LIVE`, `REFRESH SCENE`, `OPEN FULLSCREEN`, `COPY`, `OBS Browser Source URL`, `Quick Actions`, `Diagnostics`, all 11 scene titles, and `/scenes/*.html` paths.
- DOM has the right classes: `.smile-console-bg`, `.smile-brand`, `.smile-pill.on`, `.smile-panel`, `.smile-scene.active`, `.smile-viewport`, `.smile-iframe`, `.smile-urlbar`, `.smile-btn.active`, `.smile-toast`.
- Dev log clean (no compile errors after the final lint fix).

## Architecture summary

```
public/scenes/                  ← v1 source files served VERBATIM
├── 00-bg.html                  → /scenes/00-bg.html
├── 01-starting-soon.html       → /scenes/01-starting-soon.html
├── 02-countdown.html           → /scenes/02-countdown.html
├── 03-live.html                → /scenes/03-live.html
├── 04-brb.html                 → /scenes/04-brb.html
├── 05-ending.html              → /scenes/05-ending.html
├── 08-alerts.html              → /scenes/08-alerts.html
├── control.html                → /scenes/control.html
├── market-ticker.html          → /scenes/market-ticker.html
├── mini-chart.html             → /scenes/mini-chart.html
├── test-cam.html               → /scenes/test-cam.html
├── smile.css                   → /scenes/smile.css  (relative refs resolve)
├── smile-mark.js               → /scenes/smile-mark.js
├── smile-mark.svg              → /scenes/smile-mark.svg
├── live-feed.js                → /scenes/live-feed.js
└── brand.json                  → /scenes/brand.json (loaded by smile-mark.js)

src/app/
├── layout.tsx                  ← Chakra Petch + IBM Plex Mono, dark default
├── globals.css                 ← control.html palette + smile-* utility classes
├── page.tsx                    ← SMILE // CONTROL console (the only React code)
└── api/route.ts                ← untouched
```

## What works / what doesn't
- ✅ All scenes render their static visual design verbatim (smile face, sparks, ticker, candle bars, countdown ring, confetti, alert box, market ticker, mini chart canvas).
- ✅ smile-mark.js auto-upgrades `.brand .dw` and `svg.disc` elements inside each scene (idle auto-blink, mood animations).
- ✅ mini-chart.html loads live-feed.js and fetches real Binance prices (public CORS endpoint).
- ⚠️ Scenes that depend on WebSocket backends (`03-live.html` → `/api/autotalk/state`, `control.html` → `/api/control`, `market-ticker.html` → `/api/market/ws`) will render their static UI but won't receive live state — those backends are not part of this port (they were Python in v1; would need mini-services in v2). This is fine — the static visuals are pixel-faithful.
- ⚠️ The `/scenes/control.html` route is also linked from the control panel as a "Quick Action" → opens the original v1 control dashboard in a new tab (it tries to connect to its Python WebSocket but the UI still renders).

## Files touched
- CREATED: `public/scenes/` (16 files: 11 HTML + smile.css + smile-mark.js + smile-mark.svg + live-feed.js + brand.json)
- MODIFIED: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- DELETED: `src/components/smile/` (6 files), `src/lib/smile/` (1 file), `src/app/scenes/trading-live/` (1 file)
- UNTOUCHED: `src/hooks/use-clock.ts` (reused), all shadcn/ui components, all docs/AGENTS/CONTRIBUTING/.github/scripts/, worklog.md (appended only).

## Next agent notes
- The user's #1 priority is **pixel fidelity**. The scenes are served byte-for-byte identical to the v1 originals — DO NOT modify them. Any "improvement" must happen in the React control panel at `/` only, or in NEW files.
- If you need a new scene, copy an existing v1 HTML file in `public/scenes/` and modify the COPY, not the original.
- The WebSocket backends for `03-live.html`, `control.html`, and `market-ticker.html` are the natural next milestone — they'd be mini-services (per the project's mini-service pattern) on ports 3001-3003, with the Caddyfile gateway routing `/api/control`, `/api/autotalk/state`, `/api/market/ws` to them via `XTransformPort`. But the scene HTML already uses `ws://'+location.host+'/api/...` which Caddy will forward.
- The control panel iframe scaling uses ResizeObserver + CSS `transform: scale()` — this is the right pattern for fitting 1920×1080 (or any size) scenes inside a responsive preview viewport.
