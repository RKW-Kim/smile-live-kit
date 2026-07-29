# Smile Live Kit

Brand-accurate, **live-data**, **multi-channel**, **portable** OBS kit for smile.co.ke trading streams.

> Philosophy: operators never hand-edit files. Colours, wordmark, handles, instruments and layouts change via brand packs, the data layer, or core PRs. See `CONTRIBUTING.md`.

## Quick start
1. `core/run-bridge.bat` (double-click). Open http://localhost:8787 to watch prices flow.
2. OBS -> *Scene Collection -> Import...* -> `obs/Smile-Trading-Kit.json` -> select **Smile Trading Kit**.
3. The **two clicks**: double-click `WEBCAM-1` -> pick camera; double-click `chat` -> paste chat-box URL.

Switch scenes with **Ctrl+Alt+F1..F5**.

## Why it works from any folder
The scene JSON points at `http://localhost:8787/...` (the bridge), not at disk paths - so cloning or unzipping anywhere never breaks it. `core/` is flat (html+css+js together) so even opening a page by double-click works.

## The key
Your Twelve Data key lives in git-ignored `core/secrets.env` (the bridge reads it automatically; it is never pushed). Indices are budget-gated to US market hours @1/min so the key survives a 24/7/365 stream. See `docs/data-and-limits.md`.

## Multi-brand
Copy `brands/template/` -> `brands/<channel>/`, edit `brand.json`, copy it to `core/brand.json`, refresh OBS. See `docs/theming.md`.

## Docs
`docs/design.md` (visual system + 1:1 mark) - `docs/theming.md` (brand schema) - `docs/data-and-limits.md` (providers, budget, dev socket spec) - `docs/obs-setup.md` - `docs/github.md`.

## License
MIT - see `LICENSE`.
