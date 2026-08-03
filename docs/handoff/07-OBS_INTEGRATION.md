# 07 — OBS INTEGRATION

## How Smile Live Kit Integrates with OBS Studio

This document specifies the OBS Studio integration model — Browser Sources, scene collections, the OBS WebSocket bridge, and the deployment pattern.

---

## The Integration Model in One Paragraph

Smile Live Kit renders scenes and overlays as Next.js routes. The OBS operator adds each route as a **Browser Source** at 1920×1080. The control console (also a Next.js route) pushes state to the scenes via Socket.io. Optionally, the console drives OBS directly via the **OBS WebSocket** protocol (cut, transition, scene switch, source visibility, filter toggles). The kit extends OBS — it does not replace it.

---

## Browser Sources — The Core Integration

OBS Studio ships with a Browser Source since v21. A Browser Source is a Chromium Embedded Framework (CEF) instance that renders a URL at a fixed resolution. It is the primary integration point.

### Adding a Smile Live Kit scene as a Browser Source

1. In OBS Studio → **Sources** panel → **+** → **Browser**.
2. **Create new** → name it (e.g., "W21 Trading Live").
3. **Properties:**
   - **URL:** `https://smile-live-kit.vercel.app/scenes/trading-live`
   - **Width:** `1920`
   - **Height:** `1080`
   - **FPS:** `60` (matches the dev server + Vercel build target).
   - **Custom CSS:** leave the OBS default (`body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }`). For scenes, the body background is Terminal Black anyway (set by the route layout). For overlays, the transparent default is what we want.
   - **Shutdown source when not visible:** ✅ — saves CPU when the scene is not on program/preview.
   - **Refresh browser when scene becomes active:** ✅ — ensures the scene re-hydrates on activation (Socket.io reconnects, latest state is fetched).
4. **OK.** The scene appears in the OBS preview.

### URL patterns

| Route | Purpose | Body |
|-------|---------|------|
| `https://smile-live-kit.vercel.app/scenes/trading-live` | The W21 Trading live scene | Terminal Black |
| `https://smile-live-kit.vercel.app/scenes/starting-soon` | Pre-roll | Terminal Black |
| `https://smile-live-kit.vercel.app/scenes/be-right-back` | Interstitial | Terminal Black |
| `https://smile-live-kit.vercel.app/scenes/off-air` | 24/7 fill | Terminal Black |
| `https://smile-live-kit.vercel.app/overlays/ticker` | Live market-data ticker | Transparent |
| `https://smile-live-kit.vercel.app/overlays/lower-third` | Animated lower-third | Transparent |
| `https://smile-live-kit.vercel.app/overlays/alert` (future) | Follow/sub/donation/raid alert | Transparent |

### Local dev URLs

In local dev, the URL is `http://localhost:3000/scenes/<name>`. OBS supports localhost URLs — useful for development + for air-gapped production setups.

### Cache-busting + version pinning

For production stability, the OBS operator can pin to a specific Vercel preview URL instead of the production URL:

- **Production:** `https://smile-live-kit.vercel.app/scenes/trading-live` — updates on every merge to `main`.
- **Preview-pinned:** `https://smile-live-kit-git-<commit-sha>-rkwkim22.vercel.app/scenes/trading-live` — frozen at a specific commit.

The preview-pinned pattern is useful for live broadcasts where stability is more important than the latest features. The console footer shows the current commit SHA (`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`) for traceability.

---

## OBS Scene Collections

An OBS Scene Collection is a JSON file describing the OBS project's scenes, sources, transforms, filters, and transitions. Smile Live Kit scenes are added as Browser Sources within an OBS Scene Collection.

### The W21 Trading scene collection (reference)

```json
{
  "name": "Smile Trading Kit",
  "scenes": [
    {
      "name": "Pre-roll",
      "sources": [
        { "type": "browser_source", "url": "https://smile-live-kit.vercel.app/scenes/starting-soon", "width": 1920, "height": 1080 }
      ]
    },
    {
      "name": "Live",
      "sources": [
        { "type": "browser_source", "url": "https://smile-live-kit.vercel.app/scenes/trading-live", "width": 1920, "height": 1080 },
        { "type": "droidcam_input", "name": "Host Camera", "transform": { "x": 1344, "y": 576, "width": 576, "height": 324 } },
        { "type": "audio_input_capture", "name": "Host Mic" }
      ]
    },
    {
      "name": "Be Right Back",
      "sources": [
        { "type": "browser_source", "url": "https://smile-live-kit.vercel.app/scenes/be-right-back", "width": 1920, "height": 1080 }
      ]
    },
    {
      "name": "Off Air",
      "sources": [
        { "type": "browser_source", "url": "https://smile-live-kit.vercel.app/scenes/off-air", "width": 1920, "height": 1080 }
      ]
    }
  ],
  "transitions": [
    { "type": "cut", "duration": 0 },
    { "type": "fade", "duration": 500 }
  ]
}
```

### The legacy v1 scene collection
The v1 Python+static-HTML kit shipped an OBS scene collection at `obs/Smile-Trading-Kit.json` on the `legacy/v1-python-static` branch. It is a reference for the structure, but its URLs point at the v1 static HTML scenes. The v2 kit's scene collection (above) supersedes it — same OBS pattern, new URLs.

### Future: Scene Collection export from the console
The console's future `SceneCollectionExport` feature (`POST /api/scene/export-obs`) generates an OBS Scene Collection JSON from the current Smile Live Kit preset library. The operator downloads the JSON, imports it into OBS (Scene Collection → Import), and the entire scene structure is recreated. This is round-trip parity with OBS — the kit can both feed OBS (Browser Sources) and be driven by OBS (OBS WebSocket).

---

## OBS WebSocket — The Console Drives OBS

The OBS WebSocket protocol (`obs-websocket` v5, built into OBS Studio 28+) lets external clients control OBS — switch scenes, toggle source visibility, set transitions, start/stop streaming, read stream status. Smile Live Kit's console can be an OBS WebSocket client.

### The bridge
- Library: `obs-websocket-js` (npm).
- The console connects to `ws://localhost:4455` (OBS default) with the OBS WebSocket password (configured in OBS → Tools → obs-websocket Settings).
- The connection is optional — if the URL/password is unset, the console falls back to "manual OBS" mode (the operator switches scenes in OBS by hand).

### What the console does with OBS WebSocket

| Console action | OBS WebSocket call |
|----------------|---------------------|
| Click scene card → preview | `SetCurrentPreviewScene` |
| Double-click scene card → program | `SetCurrentProgramScene` (cut) or `TriggerTransition` (fade/stinger) |
| Click "Go Live" | `StartStream` |
| Click "End Stream" | `StopStream` |
| Toggle source visibility | `SetSceneItemEnabled` |
| Set transition | `SetCurrentSceneTransition` |
| Read stream status | `GetStreamStatus` (polled every 5s) → updates the StreamHealthPanel |
| Read tally | `GetActiveScene` → updates the TallyIndicator |

### The reverse path — OBS → console
The OBS WebSocket also emits events. The console subscribes to:
- `CurrentProgramSceneChanged` → updates the active-scene highlight.
- `StreamStateChanged` → updates the stream-status badge.
- `SceneItemEnableStateChanged` → updates source-visibility toggles.

This means if the operator switches scenes in OBS directly (with the mouse, or with a hotkey), the console reflects it. The console and OBS are bidirectionally synced.

### Security
The OBS WebSocket password is stored server-side (env var `OBS_WEBSOCKET_PASSWORD`). The browser never sees it. The console calls a Smile Live Kit API route (`/api/obs-websocket/*`) which proxies to OBS — the API route holds the password.

For a remote OBS machine (not localhost), set `NEXT_PUBLIC_OBS_WEBSOCKET_URL` to `ws://<obs-host>:4455` and ensure OBS's WebSocket server is configured to allow remote connections (with the password + a strong one).

---

## OBS Community Plugins — Reference

These are the OBS community plugins that inform Smile Live Kit's feature roadmap. We do NOT depend on them — Smile Live Kit is OBS-Stock-compatible. But operators who already use them get extra capability.

| Plugin | What it does | Smile Live Kit equivalent / interaction |
|--------|--------------|-----------------------------------------|
| **OBS WebSocket** | Programmatic scene control | The console uses it (optional). |
| **StreamFX** | Source filters (blur, shaders, tracking) | Out of scope for Smile Live Kit; the kit's scenes are CSS/DOM-rendered. |
| **Advanced Scene Switcher** | Auto-scene-switching on time/window/file | The console's SchedulePanel + 24-hr grid auto-pilot covers the time-based case. |
| **Source Record** | Per-source recording | Out of scope; OBS handles recording. |
| **Move Transition** | Animated source moves between scenes | Out of scope; the kit's transitions are within the scene (Framer Motion), not between OBS scenes. |
| **Input Overlay** | Keyboard/controller overlay | A future overlay route (`/overlays/input`). |
| **Scene Note** | Operator notes on scenes | The console's scene cards have a "note" field. |

---

## Deployment Patterns

### Pattern 1 — Vercel-hosted (default)

- Smile Live Kit is deployed on Vercel at `https://smile-live-kit.vercel.app`.
- OBS Browser Sources point at the Vercel URL.
- The console is opened in a browser on the operator's machine.
- The OBS WebSocket bridge (if used) runs on the operator's machine (the console connects to localhost:4455).

**Pros:** Zero infrastructure, auto-deploy on push, free Hobby tier.
**Cons:** Vercel serverless has cold starts (mitigated by OBS's "Refresh on active" setting); Socket.io may need a separate persistent host (see [`13-GITHUB_MIGRATION_GUIDE.md`](13-GITHUB_MIGRATION_GUIDE.md) §"Socket.io on Vercel").

### Pattern 2 — Self-hosted on a VPS

For the 24/7 W21 Trading channel, the kit is deployed on the same VPS that runs FFmpeg. This collocates the kit with the streaming encoder for lower latency + zero external dependencies.

- VPS runs: Next.js (production build, `bun run start`) + FFmpeg loop + (optionally) Socket.io server + (optionally) OBS WebSocket bridge (if OBS is also running on the VPS — rare; usually OBS is on the operator's machine).
- OBS (on the operator's machine) Browser Sources point at `http://<vps-host>:3000/scenes/<name>`.
- The console is opened on the operator's machine at `http://<vps-host>:3000/`.

**Pros:** Single machine, lower latency, immune to Vercel cold starts.
**Cons:** Operator manages the VPS (security updates, restarts, monitoring).

### Pattern 3 — Hybrid (recommended for 24/7)

- Smile Live Kit is on Vercel (Pattern 1) for the console + the scenes used during live sessions.
- For the 24/7 fill blocks (when no operator is present), FFmpeg on the VPS loops pre-recorded video that already includes the W21 branding baked in (recorded with Smile Live Kit scenes overlaying the trading screen during the live session). The Smile Live Kit scenes are NOT live during fill — they're baked into the VOD.

**Pros:** Best of both — live operator sessions use the live kit; fill blocks use pre-recorded VOD with the kit baked in.
**Cons:** Slightly more complex content pipeline (record → bake → upload → loop).

See [`../verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md`](../verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md) for the full hybrid model.

---

## OBS Hotkeys + Smile Live Kit

OBS supports hotkeys for scene switching, source toggling, start/stop stream, etc. Smile Live Kit does NOT define its own hotkeys — it leverages OBS's. The console's hotkeys (future) will mirror OBS's where applicable (Ctrl+1-9 for scene switch, etc.).

---

## OBS Profile + SLO Management

OBS Profiles store stream settings (RTMP key, encoder, bitrate). SLOs (Stream Output Settings) store output settings (resolution, framerate, recording path).

Smile Live Kit does NOT manage OBS Profiles/SLOs — that's OBS's job. The kit's StreamHealthPanel reads the active profile's settings (via OBS WebSocket `GetProfileSettings`) and displays them for the operator's awareness.

---

## Limitations + Gotchas

1. **Browser Source refresh lag:** When OBS refreshes a Browser Source (on scene activation), there's a ~500ms delay while the page re-hydrates + Socket.io reconnects. For live switching, use the "Cut" transition (instant) over "Fade" (which would show the refresh). The SchedulePanel's auto-pilot accounts for this.
2. **CEF version lag:** OBS's Chromium Embedded Framework lags the latest Chrome by 6-12 months. Test new CSS features (e.g., `:has()`, container queries) in the OBS CEF before relying on them. The dev server's Chrome is NOT the same as OBS's CEF.
3. **Audio:** Browser Sources can output audio (e.g., if a scene plays background music). Smile Live Kit scenes are silent by default — audio is handled by OBS (host mic, music beds, etc.). If a scene needs audio (future — a "newsroom ambience" bed), route it via OBS's Browser Source audio, not via the scene's `<audio>` element.
4. **Hardware acceleration:** OBS Browser Source uses GPU-accelerated compositing. On low-end hardware (the Xeon/1050Ti desktop, the N3710 laptop), multiple Browser Sources can stress the GPU. Mitigation: use the "Shutdown source when not visible" setting; limit active Browser Sources to 2-3 per OBS scene.
5. **Transparent overlays + background removal:** If OBS is using a background-removal filter (StreamFX, OBS's built-in virtual background) on a camera source, transparent overlays composite correctly over the result. No interaction needed.

---

*Next: [`08-CONTROL_CONSOLE.md`](08-CONTROL_CONSOLE.md) for the console spec.*
