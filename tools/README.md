# Smile Live Kit — Brand-accurate, live-data, multi-channel, portable OBS kit for smile.co.ke

> Philosophy: operators never hand-edit files. Colours, wordmark, handles, instruments and layouts change via brand packs, the data layer, or core PRs.

## Quick start v2 (Alpine + HTMX)

1. `core/run-bridge.bat` (double-click). Open http://localhost:8787 — this is your Control Deck.

2. OBS -> Scene Collection -> Import -> `obs/Smile-Trading-Kit-v2.json` -> select **Smile Trading Kit v2**. If upgrading from v1, keep v1 as backup.

3. The two clicks: double-click `WEBCAM-1` -> pick camera; double-click `chat` -> paste chat-box URL.

4. Enable OBS WebSocket: OBS -> Tools -> obs-websocket Settings -> Enable, set password, copy to `core/secrets.env`.

Switch scenes with **Ctrl+Alt+F1..F5** or via Control Deck.

## Why it works from any folder

Scene JSON points at `http://localhost:8787/...` (the bridge), not disk paths. `core/` is flat (html+css+js together) so even opening by double-click works, but v2 uses bridge for live data + OBS control.

## The key

Your Twelve Data key lives in git-ignored `core/secrets.env`. Indices are budget-gated to US market hours @1/min so key survives 24/7/365. See `docs/data-and-limits.md`.

## Multi-brand

Copy `brands/template/` -> `brands/<channel>/`, edit `brand.json`, copy it to `core/brand.json`, refresh OBS. Or use Control Deck -> Brand Switcher (v2 auto reloads via WS).

## Docs

`docs/design.md` - `docs/theming.md` - `docs/data-and-limits.md` - `docs/obs-setup.md` - `docs/github.md` - `docs/layout-engine.md` (new)

## Stack v2

Alpine.js 3.x + HTMX 1.12 SSE — 30kb total, no build step. HTML is the transition, not video.
