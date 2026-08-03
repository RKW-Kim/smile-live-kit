# ADR-0001: Next.js App Router as the Scene/Overlay Renderer

## Status
Accepted — 2026-08-03 (v2 foundation)

## Context

Smile Live Kit needs to render full-screen 1920×1080 broadcast scenes and overlays that OBS Studio consumes as Browser Sources. The kit also needs a grandma-operable control console at `/`. The choice of rendering framework determines:

1. How scenes are addressed (URL? file? IPC?).
2. How they're consumed by OBS (Browser Source? plugin? custom protocol?).
3. How the console pushes state to scenes (HTTP? WebSocket? shared memory?).
4. How the codebase is structured (one app? multiple apps? a custom server?).
5. How the deployment target is chosen (Vercel? VPS? container?).

The options considered:

### Option A — Custom rendering engine (vizrt / Ross XPression / Compix pattern)
A custom React app (or a Canvas/WebGL engine) that renders scenes in a proprietary runtime. The operator uses a custom player; OBS captures the player via window capture or via a custom plugin.

- **Pros:** Full control over rendering pipeline; can do things the browser can't (e.g., hardware video mixing).
- **Cons:** Massive engineering effort. OBS integration requires a custom plugin. Cannot leverage the browser's URL-addressable model. Locks the operator into a custom player. Does not align with the "OBS is the gold standard" principle (Rule 3) — OBS Browser Source is the natural integration point.

### Option B — Static HTML files served by a static host (the v1 pattern)
The v1 Python+static-HTML kit (preserved on `legacy/v1-python-static`) used static HTML files served by Flask. Each scene was a `.html` file. The console was a separate admin page.

- **Pros:** Simple. No build step. No framework. Works on any host.
- **Cons:** No component reuse (every scene re-implements the W21 mark, the ticker, the layout). No state management (the console can't push state to scenes without a custom WebSocket bridge — which v1 had, in Python). No TypeScript. No modern DX. Doesn't scale beyond ~5 scenes. The v1 kit hit these limits — that's why v2 exists.

### Option C — Single-page React app (Vite + React, not Next.js)
A Vite-built React SPA where scenes are routes within the SPA. The console and the scenes share the same JS bundle.

- **Pros:** Fast dev loop. No server. Easy to deploy as a static site.
- **Cons:** No SSR (worse first-paint, worse SEO — relevant for the console's metadata). No API routes (need a separate backend for Deriv/Twelve Data proxying). No server-side env var protection (API tokens would leak to the browser or require a separate backend). The "one bundle for console + scenes" model means a console change can break a scene.

### Option D — Remix (instead of Next.js)
Remix is a React framework similar to Next.js, with a focus on nested routes + progressive enhancement.

- **Pros:** Excellent data-loading model. Good docs. Active community.
- **Cons:** Smaller ecosystem than Next.js. Vercel's first-class Next.js support is unmatched (Vercel built Next.js). The Smile Live Kit stack already aligns with Next.js conventions (App Router, Route Handlers, `next/font`, `next/image`). Switching to Remix would buy nothing and cost the Vercel DX.

### Option E — Next.js Pages Router (instead of App Router)
The older Next.js routing model. Each route is a file in `pages/`. API routes are in `pages/api/`.

- **Pros:** Mature. Stable. Lots of examples.
- **Cons:** No nested layouts (every scene re-implements the SceneFrame wrapper). No React Server Components. No streaming. The App Router is the future — Next.js 16 recommends it. The Pages Router is in maintenance mode.

### Option F — Next.js App Router (chosen)
Each scene/overlay is a route under `src/app/scenes/*` or `src/app/overlays/*`. The console is at `src/app/page.tsx`. Route Handlers in `src/app/api/*` proxy market-data requests. Layouts in `src/app/scenes/layout.tsx` and `src/app/overlays/layout.tsx` enforce the 1920×1080 + transparent-body contracts.

## Decision

**Use Next.js 16 with the App Router as the scene/overlay renderer.**

Each scene is a route at `/scenes/<name>` that renders a 1920×1080 page with a Terminal Black body. Each overlay is a route at `/overlays/<name>` that renders a 1920×1080 page with a transparent body. The console is at `/`. API routes proxy market-data requests (Deriv, Twelve Data) with server-side token protection. Layouts enforce the scene/overlay frame contracts.

OBS consumes each route as a Browser Source at 1920×1080. The console pushes state to scenes via Socket.io (or SSE fallback for Vercel serverless — see ADR-0002 when written).

## Consequences

- **Scenes are URL-addressable** — `https://smile-live-kit.vercel.app/scenes/trading-live`. Previewable in any browser. Shareable as a link. Embeddable in a dashboard. OBS-native (Browser Source is a URL).
- **Component reuse** — the W21 mark, the ticker, the lower-thirds, the price readout are React components shared across scenes. No re-implementation per scene.
- **Server-side token protection** — Deriv/Twelve Data API tokens stay server-side (in Route Handlers). The browser never sees them.
- **Layout-enforced contracts** — `src/app/scenes/layout.tsx` forces Terminal Black body + `overflow: hidden` on every scene. `src/app/overlays/layout.tsx` forces transparent body + `overflow: hidden` on every overlay. A new scene/overlay route cannot accidentally break the frame contract.
- **Vercel-native** — Vercel builds Next.js with zero config. Preview deployments per branch. Edge runtime available for future WebSocket support.
- **Bundle splitting** — the console and the scenes are separate routes; they don't share a bundle. A console change can't break a scene's bundle.
- **Turbopack** — Next.js 16's Turbopack dev server is fast (sub-second HMR even with many scene routes).
- **Learning curve** — App Router is newer than Pages Router; some patterns (layouts, route groups, parallel routes) take getting used to. Mitigated by the `docs/handoff/` docs.
- **Socket.io on Vercel** — serverless cold-starts are hostile to long-lived Socket.io connections. Requires a deployment-target decision (Vercel Edge, separate persistent host, or SSE fallback). Documented in `docs/handoff/13-GITHUB_MIGRATION_GUIDE.md` §5. The codebase targets the Socket.io API; the deployment target is swappable.

## Rejected Alternatives

- **Option A (custom rendering engine)** — too much engineering effort; doesn't align with OBS-as-gold-standard (Rule 3).
- **Option B (static HTML)** — the v1 pattern; hits reuse + state-management limits past ~5 scenes.
- **Option C (Vite SPA)** — no SSR, no API routes, no server-side env var protection. The Smile Live Kit stack needs all three.
- **Option D (Remix)** — no advantage over Next.js for this use case; loses Vercel's first-class Next.js DX.
- **Option E (Next.js Pages Router)** — no nested layouts, no RSC, no streaming. The App Router is the future.

## References

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [OBS Browser Source docs](https://obsproject.com/kb/browser-source)
- The v1 legacy kit on `legacy/v1-python-static` (reference for what to port, not what to copy).
- `docs/handoff/01-PROJECT_VISION.md` §"Why Next.js Routes as Scenes?"
- `docs/handoff/02-ARCHITECTURE.md` §"System 1: The Scene Router"
- `docs/handoff/06-SCENE_MODEL.md` for the scene/overlay frame contract.
- `docs/handoff/07-OBS_INTEGRATION.md` for the OBS Browser Source wiring.
