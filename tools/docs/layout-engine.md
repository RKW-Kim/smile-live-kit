# Layout Engine - Camera Auto-Place

HTML controls OBS camera placement via bridge proxy.

brand.json:
```json
layouts.scenes.CHART.camera = { x:1440, y:810, width:400, height:225, cornerRadius:16 }
```

Bridge endpoint:
POST /api/layout/apply { scene:"CHART", layout:"CHART" }

This calls obs-websocket SetSceneItemTransform for WEBCAM-1.

Move Transition plugin animates the move smoothly (300ms).

Control Deck button triggers it, or call automatically on scene load:
in chart.html: fetch('/api/layout/apply', {method:'POST', body:JSON.stringify({scene:'CHART'})})

For HTML overlay framing camera: put camera behind overlay.html browser source that draws rounded border.
