# Smile Live Kit v3 — 100% Relative, No localhost, 1:1 SVG

No more http://localhost:8787 in OBS. Everything is file:// relative.

## Quick start v3

1. Clone anywhere.

2. In Zed terminal:
```
node core/setup-obs.mjs
```
This patches obs/Smile-Trading-Kit-v3.json -> obs/Smile-Trading-Kit-FINAL.json with absolute file:// paths for THIS machine. Import FINAL into OBS.

3. OBS -> Scene Collection -> Import -> obs/Smile-Trading-Kit-FINAL.json

4. Two clicks: WEBCAM-1 pick camera, chat paste URL. No bridge needed for static look.

5. For LIVE data (optional):
```
cp core/secrets.env.example core/secrets.env
# edit key
node core/live-updater.mjs   # writes core/live.json every 60s
```
Ticker.html auto reads live.json via relative fetch — no server, no localhost. If live.json missing, shows mock data so stream never breaks.

## Why no localhost now?

v1 used localhost to avoid absolute disk paths breaking when cloning. v3 solves it differently: setup-obs.mjs generates absolute file:// paths at import time, so you can clone anywhere and re-run setup.

All HTML uses relative ./vendor/*, ./brand.json, ./live.json — double-click works, OBS file:// works.

## 1:1 SVG

See core/assets/smile-mark.svg — viewBox 100x100, preserveAspectRatio xMidYMid meet, animation via transform-origin center, scale only, no stretch. Never distorts.
