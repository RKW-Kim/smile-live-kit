# 12 — KNOWN ISSUES

## Bugs, Gotchas, SSR Pitfalls — Read Before Writing Code

This document catalogs the traps that have been hit + solved (or documented as known limitations) in Smile Live Kit. **Read this before writing code** — it saves you from re-solving solved problems.

Each entry: ID, severity, status (fixed / documented / open), the symptom, the root cause, and the fix (or the workaround).

---

## Severity Definitions

- **CRITICAL** — A core flow is broken (the console won't load, a scene won't render, the stream goes dark). Must fix in-tree.
- **HIGH** — A feature is broken under specific conditions, or there's a real runtime error / data-loss path. Must fix in-tree.
- **MEDIUM** — A feature works but has a UX gap or a defensive-hardening gap. Document for a follow-up.
- **LOW** — Cosmetic, trivial perf, or noted-for-future-reference. Document.

---

## Foundation Issues (v2 setup)

### FOUND-1 — Vercel preview 404s on commits authored by an unverified email
- **Severity:** CRITICAL (silently blocks every preview).
- **Status:** Documented (the rule is in `AGENTS.md` Step 2 + `docs/deployment/VERCEL_PREVIEW_GUIDE.md`).
- **Symptom:** A pushed feature branch gets a `404 DEPLOYMENT_NOT_FOUND` on the Vercel preview URL. CI passes. GitHub shows no error. The preview URL just doesn't exist.
- **Root cause:** Vercel's Hobby-tier anti-abuse protection refuses to build previews for commits whose author email isn't linked to a verified GitHub account. A commit authored by `z@container` or `ai-handoff@smile.local` is silently rejected.
- **Fix:** Set the git author at clone time:
  ```bash
  git config user.name "RKW-Kim"
  git config user.email "rkw.kim22@gmail.com"
  ```
  Verify before committing:
  ```bash
  git config user.email   # must print: rkw.kim22@gmail.com
  ```
  If a bad-author commit slipped through:
  ```bash
  git commit --amend --author="RKW-Kim <rkw.kim22@gmail.com>" --no-edit
  git push --force-with-lease   # feat/* branches allow force-push
  ```
  See `docs/deployment/VERCEL_PREVIEW_GUIDE.md` for the full guide.

### FOUND-2 — The `legacy/v1-python-static` branch must not be touched
- **Severity:** HIGH (data preservation).
- **Status:** Documented (the rule is in `AGENTS.md` Step 1 + `00-MASTER-HANDOFF-INDEX.md`).
- **Symptom:** An AI helpfully "cleans up" the legacy branch or rebases it onto main, destroying the v1 kit.
- **Root cause:** The legacy branch is a separate lineage — it preserves the v1 Python+static-HTML kit that v2 supersedes. It is NOT a feature branch.
- **Fix:** Never commit to `legacy/v1-python-static`. Never rebase it. Never delete it. If you need to port a v1 concept to v2, copy the *idea* into the v2 codebase; cite the v1 file in the worklog entry.

### FOUND-3 — The fine-grained PAT in the git remote is intentional, not a security issue
- **Severity:** LOW (noise reduction).
- **Status:** Documented (the rule is in `AGENTS.md` Step 2 + `docs/deployment/SAFEGUARDS.md`).
- **Symptom:** An AI flags the `github_pat_<...>@github.com` in `git remote -v` as a leaked secret.
- **Root cause:** The token is a fine-grained PAT scoped to this repository only (Contents:RW, Pull requests:RW, Issues:RW). It is the industry-standard pattern for CI/CD.
- **Fix:** Do NOT re-raise it as a security concern. Only warn the human if the token is a classic `ghp_` PAT (which has broad account-wide access).

---

## SSR + Hydration Pitfalls

### SSR-1 — `useSyncExternalStore` without `getServerSnapshot` crashes on hydration
- **Severity:** HIGH.
- **Status:** Documented (the rule is in `CONTRIBUTING.md`).
- **Symptom:** A Zustand store that reads `localStorage` or `window` during initialization causes a hydration mismatch — the server renders one value, the client renders another, React warns, and the UI flickers.
- **Root cause:** Zustand's `useSyncExternalStore` requires a `getServerSnapshot` (the 3rd argument) to return a stable server-side value. Without it, the store reads `localStorage` on the client but not on the server.
- **Fix:** Always pass `getServerSnapshot`:
  ```ts
  const value = useSyncExternalStore(
    store.subscribe,
    () => store.getState().value,
    () => initialValue  // server snapshot — must match the server-rendered value
  )
  ```
  For Zustand specifically, use the `persist` middleware with the `skipHydration: true` option + a manual `rehydrate()` call in `useEffect`.

### SSR-2 — Scene routes must not read `window` or `document` at module load time
- **Severity:** HIGH.
- **Status:** Documented.
- **Symptom:** A scene route throws `ReferenceError: window is not defined` during `next build` (SSR).
- **Root cause:** Next.js renders every route on the server first. Code that reads `window` at module load (outside `useEffect`) runs on the server, where `window` doesn't exist.
- **Fix:** Wrap all `window`/`document` access in `useEffect` or in a `typeof window !== 'undefined'` guard.

### SSR-3 — The `--w21-active` CSS variable must be set on the server-rendered HTML
- **Severity:** MEDIUM.
- **Status:** Documented.
- **Symptom:** The scene's W21 mark + ticker render in the wrong color for the first frame, then snap to the correct channel color after hydration.
- **Root cause:** The channel color is read from Zustand (client-side), so the server renders with the default (Trading cyan).
- **Fix:** Set the `--w21-active` CSS variable on the `<html>` or `<body>` tag via a server component, reading the channel from the route's URL (e.g., `/scenes/trading-live` → `--w21-trading`). The ChannelSelector on the console updates it client-side.

---

## OBS Browser Source Pitfalls

### OBS-1 — Browser Source refresh on scene activation causes a ~500ms blank
- **Severity:** MEDIUM.
- **Status:** Documented (in `07-OBS_INTEGRATION.md`).
- **Symptom:** When OBS switches to a scene containing a Smile Live Kit Browser Source (with "Refresh browser when scene becomes active" enabled), there's a ~500ms blank while the page re-hydrates + Socket.io reconnects.
- **Root cause:** The Browser Source reloads the page; the page boots Next.js, hydrates React, opens Socket.io, fetches state. That takes ~500ms even on a fast connection.
- **Fix:** Use the "Cut" transition (instant) over "Fade" (which would show the blank). For live shows where the operator wants smooth transitions, disable "Refresh browser when scene becomes active" — the Browser Source stays loaded, the scene updates via Socket.io. (Trade-off: the source uses CPU even when not on program; mitigation: keep the source visible in OBS but not on program.)

### OBS-2 — OBS's Chromium Embedded Framework (CEF) lags the latest Chrome
- **Severity:** MEDIUM.
- **Status:** Documented.
- **Symptom:** A CSS feature (e.g., `:has()`, container queries, `@container`) works in the dev browser but not in OBS.
- **Root cause:** OBS's CEF is typically 6-12 months behind Chrome.
- **Fix:** Test new CSS features in OBS before relying on them. The dev server's Chrome is NOT the same as OBS's CEF. For critical features, check the [CEF version in the OBS release notes](https://github.com/obsproject/obs-studio/releases) and the [caniuse.com](https://caniuse.com) support table for that CEF version.

### OBS-3 — Transparent overlays rely on OBS's default Browser Source CSS
- **Severity:** MEDIUM.
- **Status:** Documented (in `06-SCENE_MODEL.md`).
- **Symptom:** An overlay route shows a black background in OBS instead of being transparent.
- **Root cause:** OBS's default Browser Source CSS is `body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }` — transparent. If the operator overrides this (e.g., removes the rgba), the overlay breaks. If the scene's `<body>` sets a background, it overrides the OBS default.
- **Fix:** Overlay routes set `<html>` + `<body>` to `background: transparent` in the route-group layout (`src/app/overlays/layout.tsx`). Do NOT override OBS's Custom CSS. If the overlay still shows black, check the operator's OBS Browser Source properties → "Custom CSS" field is at the default.

### OBS-4 — Multiple Browser Sources stress low-end GPUs
- **Severity:** MEDIUM.
- **Status:** Documented.
- **Symptom:** The OBS preview stutters or the stream drops frames when multiple Smile Live Kit Browser Sources are active.
- **Root cause:** Each Browser Source is a Chromium instance with GPU-accelerated compositing. On the Xeon/1050Ti desktop (4GB VRAM) or the N3710 laptop (broken QuickSync), 3+ active Browser Sources can saturate the GPU.
- **Fix:** Enable "Shutdown source when not visible" on every Browser Source. Limit active Browser Sources to 2-3 per OBS scene. Use a single Smile Live Kit scene that internally switches content (via Socket.io) rather than multiple OBS scenes each with their own Browser Source.

---

## W21 Brand Compliance

### BRAND-1 — Never modify `W21Mark.tsx`
- **Severity:** CRITICAL (brand contract violation).
- **Status:** Documented (Rule 2 in `AGENTS.md`).
- **Symptom:** An AI "improves" the mark — tweaks the border weight, nudges the dot, changes the typeface, adds an animation library.
- **Root cause:** The mark is a design contract, not a code artifact. Its proportions, border, type, dot position, and glow are locked. The ONLY variable is color (per channel).
- **Fix:** Do NOT modify `W21Mark.tsx`. If you need a W21-adjacent element (watermark, favicon, lockup variant), build it as a separate component that composes `W21Mark`. Bugs in the mark go in this doc, not in local patches.

### BRAND-2 — Never hard-code a channel color
- **Severity:** HIGH.
- **Status:** Documented.
- **Symptom:** A scene or component has `color: '#00F0FF'` hard-coded for the Trading channel. The channel is later switched to News, but the component stays cyan.
- **Root cause:** The channel color was hard-coded instead of sourced from `channels.ts`.
- **Fix:** Always `getChannel(channel).color` (TypeScript) or `var(--w21-active)` (CSS). The active channel color is set on the scene/console root; every component inherits it.

### BRAND-3 — Never use indigo or blue as a decorative accent
- **Severity:** HIGH.
- **Status:** Documented.
- **Symptom:** A console panel uses indigo `#6366F1` as a hover accent because "it looks nice." But indigo is the Innovation channel color — using it on a Trading scene is a brand violation.
- **Root cause:** The developer didn't realize indigo/blue are reserved channel colors.
- **Fix:** Generic UI accents use the active channel's color, or Grid White / Zinc for neutral surfaces. Indigo and blue appear ONLY when rendering the Innovation or Education channel.

### BRAND-4 — Numbers must be monospaced
- **Severity:** MEDIUM.
- **Status:** Documented (Rule 5).
- **Symptom:** A price readout uses the sans font; the digits shift width as the price changes, causing the column to jitter.
- **Root cause:** The developer forgot the mono rule.
- **Fix:** Every numeric readout uses `font-mono tabular-nums`. This is enforced by lint convention (a future ESLint rule will catch non-mono numeric elements).

### BRAND-5 — The structural grid must be present on every scene
- **Severity:** MEDIUM.
- **Status:** Documented (Rule 6).
- **Symptom:** A scene omits the `bg-grid` class because "it's cleaner without it." The scene looks like a one-off design, not a W21 system scene.
- **Root cause:** The developer didn't realize the grid is mandatory.
- **Fix:** Every scene root uses `bg-grid` (or `bg-grid-dense` / `bg-grid-sparse` for variants). The `SceneFrame` component enforces this by default; the `grid="none"` prop is for rare exceptions only (document why in the scene file).

---

## Library Version Drift

(No entries yet — populate as library upgrades introduce breaking changes.)

---

## Performance

### PERF-1 — Recharts in the initial bundle
- **Severity:** MEDIUM (anticipated).
- **Status:** Documented (the rule is in `04-TECH_STACK.md`).
- **Symptom:** The console's initial bundle includes `recharts` (~150KB), even though the charts are only used in the StreamHealthPanel (which the operator may not open for hours).
- **Root cause:** `recharts` is statically imported.
- **Fix:** Lazy-load the chart component: `const Chart = React.lazy(() => import('@/components/ui/chart'))`. Wrap in `<Suspense>`. The chart loads on first open, not on console boot.

### PERF-2 — Socket.io `data:tick` events can flood React state updates
- **Severity:** MEDIUM.
- **Status:** Documented (the mitigation is in `11-TRANSPORT_REALTIME.md`).
- **Symptom:** The scene's ticker stutters when many symbols are subscribed (high `data:tick` event volume).
- **Root cause:** Each `data:tick` event triggers a `setSnapshot` in the `useMarketData` hook, which re-renders the Ticker component. With 10 symbols each ticking once per second, that's 10 re-renders/sec — fine. With 50 symbols, 50 re-renders/sec — React starts to struggle.
- **Fix:** The hook throttles state updates to 100ms (the latest tick per symbol wins within the window). The Ticker component is memoized (`React.memo`) so only the changed symbol's chip re-renders, not the whole ticker.

---

## Gotchas

### GOTCHA-1 — `next/font/google` requires network access at build time
- **Severity:** LOW.
- **Status:** Documented.
- **Symptom:** `next build` fails with a font-fetch error in an air-gapped environment.
- **Root cause:** `next/font/google` downloads the Geist Sans + JetBrains Mono font files at build time.
- **Fix:** Use `next/font/local` with the font files in `public/fonts/` for air-gapped builds. For Vercel + normal CI, `next/font/google` works (Vercel has network access).

### GOTCHA-2 — The `?XTransformPort=N` query param requires Caddy/Vercel rewrite rules
- **Severity:** LOW (only matters when a mini-service exists).
- **Status:** Documented (in `AGENTS.md`).
- **Symptom:** A fetch to `/api/proxy?XTransformPort=3001&path=/deriv/tick` 404s.
- **Root cause:** The gateway (Caddy in dev, Vercel rewrites in prod) must rewrite the request to `http://localhost:3001/deriv/tick`. Without the rewrite, the request hits the Next.js app, which has no `/api/proxy` route.
- **Fix:** Add the rewrite rule to `Caddyfile` (dev) or `vercel.json` (prod). See `02-ARCHITECTURE.md` §"Mini-Services."

### GOTCHA-3 — Bun's `--frozen-lockfile` requires `bun.lock` to be committed
- **Severity:** LOW.
- **Status:** Documented.
- **Symptom:** CI fails with `error: lockfile mismatch` on `bun install --frozen-lockfile`.
- **Root cause:** `bun.lock` is gitignored or out of date.
- **Fix:** Commit `bun.lock`. After every dependency change, run `bun install` to update the lockfile, then commit it. CI uses `--frozen-lockfile` to ensure reproducible installs.

---

## Open Issues (None Currently)

(As of the v2 foundation, no open issues. Populate as they arise.)

---

## S&D Audit Follow-ups (None Currently)

(The Sweep & Defend audit process is documented in WBS CONTRIBUTING.md. Smile Live Kit has not yet run an S&D round — when it does, follow-ups go here. See WBS CONTRIBUTING.md §"S&D Audit Process" for the template.)

---

*Update this file as you hit new traps. The next AI will thank you.*
