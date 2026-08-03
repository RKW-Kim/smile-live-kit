# W21 │ TRADING — Technical Infrastructure

> **The VPS streaming model, the hybrid browser-studio + VPS-loop architecture, the storage stack, the automation layer, and the hardware assessment.** This document specifies how W21 │ TRADING stays on-air 24/7 for $0–16/month.

**Sources:** Space-Node.net (2026 VPS streaming guides), Cloudflare R2 docs, Puter developer docs, EaseUS (2026 OBS settings), Deriv MT5 Web Terminal docs, SpeakerSplit.ai docs, Fliki / Braiv / Canva / SamurAIGPT official docs, CapCut official, YouTube policy updates (LinkedIn / Shubhro Maity 2026, Nerdbot 2025, Gyre.pro, Resi.io).

---

## 1. The VPS Streaming Model (Core Innovation)

### The architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  CONTENT CREATION (Local — Kenya)                                 │
│                                                                  │
│  Xeon / 1050Ti Desktop                                           │
│  ├─ OBS Studio (NVENC encoder) records screen + camera + mic    │
│  ├─ Deriv MT5 Web Terminal (browser-based, no install)          │
│  ├─ DroidCam USB (phones as webcams — multi-camera)             │
│  └─ SpeakerSplit.ai (AI separates single-room mic into tracks)  │
│         │                                                        │
│         ▼  Raw recording (MP4, 1–4 GB per session)               │
│                                                                  │
│  EDITING (Browser-based)                                         │
│  ├─ CapCut (free, 120-min, AI silence removal, auto-captions,   │
│  │         no watermark)                                         │
│  └─ Fallback: Shotcut (desktop, free, open-source, 4GB RAM)     │
│         │                                                        │
│         ▼  Edited MP4 (3–7 GB per session)                       │
│                                                                  │
│  UPLOAD                                                          │
│  ├─ rclone → Cloudflare R2 (large video files, 10GB free tier,  │
│  │                       zero egress)                            │
│  └─ Puter.com (small files — thumbnails, metadata, scripts)     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  AUTOMATION HUB (VPS — Data Center, redundant power + network)    │
│                                                                  │
│  FFmpeg                                                          │
│  ├─ -stream_loop -1 -re -i video.mp4                             │
│  ├─ outputs via RTMP directly to YouTube Live                   │
│  ├─ systemd service auto-starts on VPS boot                      │
│  └─ watchdog script auto-restarts on crash                       │
│                                                                  │
│  n8n (self-hosted workflow automation)                           │
│  ├─ Thumbnail generation (ImageMagick + W21 templates)           │
│  ├─ Content refresh (rotate playlist weekly)                     │
│  └─ Upload scheduling                                            │
│                                                                  │
│  Puter.js (KV store + AI APIs)                                   │
│  ├─ Content calendar                                             │
│  ├─ Trade journal                                                │
│  └─ Stream-status dashboard                                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  DISTRIBUTION                                                     │
│                                                                  │
│  YouTube Live (primary 24/7 stream)                              │
│  ├─ RTMP ingest from the VPS FFmpeg                              │
│  └─ Viewers watch on YouTube (web, mobile, TV app)              │
│                                                                  │
│  (Future: Twitch, Kick — FFmpeg supports multi-RTMP at zero     │
│   additional cost; one FFmpeg process, multiple RTMP outputs)   │
└──────────────────────────────────────────────────────────────────┘
```

### How the VPS loop works

The 24/7 stream runs entirely on a Virtual Private Server (VPS), not on local hardware. FFmpeg loops pre-recorded video files indefinitely:

```bash
ffmpeg -stream_loop -1 -re -i video.mp4 \
  -c:v libx264 -preset veryfast -b:v 4500k -maxrate 4500k -bufsize 9000k \
  -pix_fmt yuv420p -g 60 -keyint_min 60 \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv "rtmp://a.rtmp.youtube.com/live2/<stream-key>"
```

Key flags:
- `-stream_loop -1` — loop the input file infinitely.
- `-re` — read input at native frame rate (real-time, not as fast as possible). This is what makes it a "stream" not a "transcode."
- `-c:v libx264 -preset veryfast -b:v 4500k` — H.264 video at 4.5 Mbps (YouTube's recommended 1080p30 bitrate). For 720p, drop to 2500–3500 kbps.
- `-pix_fmt yuv420p -g 60 -keyint_min 60` — pixel format + keyframe interval (60 frames = 1 second at 60fps, or 2 seconds at 30fps).
- `-c:a aac -b:a 128k -ar 44100` — AAC audio at 128 kbps, 44.1 kHz.
- `-f flv "rtmp://..."` — output as FLV over RTMP to YouTube's ingest endpoint.

### Auto-recovery

A `systemd` service auto-starts FFmpeg on VPS boot:

```ini
# /etc/systemd/system/w21-trading-stream.service
[Unit]
Description=W21 Trading 24/7 FFmpeg Stream
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=w21
ExecStart=/usr/local/bin/ffmpeg -stream_loop -1 -re -i /var/w21/current.mp4 ...
Restart=always
RestartSec=5
StandardOutput=append:/var/log/w21-stream.log
StandardError=append:/var/log/w21-stream.err.log

[Install]
WantedBy=multi-user.target
```

A watchdog script (cron every minute) checks if the FFmpeg process is alive + if the YouTube Live Dashboard reports the stream as healthy. If either fails, the watchdog kills the FFmpeg process + restarts the systemd unit.

### VPS requirements

| Resolution | RAM | CPU | Monthly cost | Provider examples |
|------------|-----|-----|--------------|-------------------|
| 720p (1280×720, 30fps) | 4 GB | 2 vCPU | $10–16 | Hetzner, DigitalOcean, Vultr, Contabo |
| 1080p (1920×1080, 30fps) | 8 GB | 4 vCPU | $20–30 | Same providers |
| 1080p60 | 8 GB | 4 vCPU + hardware encoder (rare on VPS) | $30+ | Same providers |

**The operator's existing VPS** may already be sufficient if it has 4GB+ RAM. The VPS can run FFmpeg alongside existing websites (FFmpeg's CPU usage is bounded by the `-re` real-time flag — it doesn't spike).

### Why VPS, not local hardware

1. **Immune to local power cuts.** Kenya's grid has occasional outages. A VPS in a data center has redundant power.
2. **Immune to local internet outages.** The VPS has redundant connectivity. Local outages don't kill the stream.
3. **Immune to local hardware failures.** The Xeon / 1050Ti desktop can crash; the stream keeps running.
4. **Always-on.** The VPS doesn't sleep. The operator's desktop does.
5. **Cheap.** $10–16/month for a 4GB VPS is the only paid line item in the entire stack.

---

## 2. The Hybrid Model — Browser Studio + VPS Loop

### The problem
The VPS loop model (above) handles 24/7 fill perfectly — pre-recorded content loops forever. But the W21 │ TRADING channel also needs live blocks (Prime Time Signals, London Session, Asian Session). A pure VPS-loop model cannot do live — the operator cannot pipe their live camera + screen + mic into the VPS without a complex WebRTC bridge.

### The solution — a hybrid model with two modes

#### Mode 1 — Browser Studio (Live Sessions)

For the live blocks, the operator uses Smile Live Kit (the browser-based studio). The console at `/` is the operator's surface. The scene route at `/scenes/trading-live` renders the live on-air scene — W21 lockup, host camera frame, live price readout, ticker. The operator switches scenes via the console; the console drives OBS via the OBS WebSocket bridge (or the operator switches in OBS directly).

- **Capture:** OBS Studio on the Xeon / 1050Ti desktop. `getDisplayMedia` for the trading screen (Deriv MT5 Web Terminal), `getUserMedia` for the camera + mic.
- **Compositing:** OBS composites the Smile Live Kit scene (Browser Source) + the camera capture + the audio capture into a single 1920×1080 stream.
- **Encoding:** OBS encodes via NVENC (the 1050Ti's hardware encoder).
- **Output:** OBS sends RTMP directly to YouTube Live. No VPS relay needed for Mode 1.
- **Recording:** OBS simultaneously records to local disk for later editing + upload to the VPS loop.

Mode 1 is for the high-energy live blocks. The stream is genuinely live. The Smile Live Kit scene renders the live price ticker, the live tally, the live clock — all in real time.

#### Mode 2 — VPS FFmpeg Loop (24/7 Fill)

For the fill blocks (Beginner Curriculum, Intermediate Curriculum, Risk + Psychology, Advanced Curriculum, Late Session Replay), the VPS loops pre-recorded content. The Smile Live Kit scenes are NOT live during fill — they're baked into the VOD.

- **Source:** Pre-recorded MP4 files on Cloudflare R2.
- **Looping:** FFmpeg on the VPS with `-stream_loop -1 -re`.
- **Output:** RTMP to YouTube Live.
- **Smile Live Kit's role:** During the recording session (Mode 1), the Smile Live Kit scenes were live on the OBS canvas. The OBS recording captured the scene as part of the video. When the recording loops on the VPS, the Smile Live Kit scene is baked into the VOD — it appears on-air, but it's not live.

### The transition between modes

- **Mode 1 → Mode 2:** The operator ends the OBS stream. The VPS FFmpeg process starts (or resumes) — the systemd watchdog detects the YouTube Live stream go idle + starts the FFmpeg loop within 5 seconds. The transition is a brief (~5 sec) "Be Right Back" card on YouTube, then the pre-recorded content resumes.
- **Mode 2 → Mode 1:** The operator starts the OBS stream (with the same YouTube stream key). The VPS FFmpeg process is killed (the watchdog detects the new RTMP connection from OBS + yields). The transition is a brief (~5 sec) cut to the live scene.

### The Smile Live Kit role in the hybrid model

Smile Live Kit is the **on-air graphics layer** for both modes:
- **Mode 1 (live):** Smile Live Kit scenes are live Browser Sources in OBS. The console drives the scenes in real time.
- **Mode 2 (fill):** Smile Live Kit scenes are baked into the pre-recorded VOD. The console is not active during fill (the operator is offline).

For Mode 2, Smile Live Kit's value is in the recording session — the operator uses the kit to produce the branded VOD. The kit's scenes are the visual identity that makes the VOD recognizable as W21 │ TRADING content.

### Why not a pure browser studio (no VPS)?

A pure browser-studio model — the operator's browser composites + encodes + streams directly — fails for 24/7:
1. **Browser tab must stay open.** If the operator's browser crashes, the stream dies.
2. **No auto-recovery.** A browser crash has no systemd watchdog.
3. **Operator's machine must be on 24/7.** Power + internet + hardware all become single points of failure.
4. **Encoding cost.** Browser-based encoding (WebCodecs) is improving but still heavier than FFmpeg on a VPS.

The hybrid model uses the browser studio where it's strong (live, interactive, compositing) and uses the VPS FFmpeg loop where it's strong (24/7, self-healing, cheap). The two modes complement each other.

---

## 3. Storage Architecture

### Two-layer storage

| Layer | Purpose | Tool | Cost |
|-------|---------|------|------|
| Large video files (3–7 GB per session) | Long-term archive + VPS streaming source. | **Cloudflare R2** — 10 GB free tier, zero egress fees. | Free up to 10 GB; $0.015/GB/month beyond. |
| Small files (thumbnails, metadata, scripts, configs) | Operational files — accessed frequently, edited collaboratively. | **Puter.com** — free cloud desktop + KV store + AI APIs. | Free. |

### Why two layers
- **Cloudflare R2** is purpose-built for large objects. Zero egress fees mean the VPS can pull video files repeatedly (for the FFmpeg loop) without cost. The 10 GB free tier covers ~2–4 sessions; beyond that, the cost is negligible ($0.015/GB/month — 100 GB costs $1.50/month).
- **Puter.com** is purpose-built for team collaboration. The shared Puter account gives every team member access to the same files from any device. The built-in code editor lets the team edit FFmpeg playlists + n8n configs in the browser. The KV store replaces Google Sheets for the content calendar + trade journal.

### The upload pipeline
- **Large files:** `rclone` on the desktop or VPS uploads to R2. Reliable for 3–7 GB files; resumable on interruption.
- **Small files:** Browser upload to Puter.com, or programmatic via Puter.js.
- **Compression:** Videos are compressed to efficient bitrates (2–4 Mbps for 720p, 4–6 Mbps for 1080p) before upload to keep file sizes manageable.

### What Puter does NOT replace
- **Large video storage** — R2 is purpose-built; Puter is for small files.
- **24/7 streaming** — FFmpeg on the VPS; Puter is a desktop OS, not a media server.
- **Video editing** — CapCut; no native editor in Puter.
- **Main website with custom domain** — Dad's existing hosting; Puter's free hosting doesn't support custom domains.

---

## 4. Automation Layer (n8n)

### What n8n does
n8n is a self-hosted workflow automation tool (open-source, free). It runs on the VPS alongside FFmpeg. Use cases:

1. **Thumbnail generation.** n8n triggers ImageMagick with a W21 template + the lesson's title → produces a 1280×720 thumbnail → uploads to Puter + YouTube Studio.
2. **Content refresh.** n8n cron job every Sunday at 23:00 EAT → rotates the FFmpeg playlist (removes the oldest lesson, adds the newest) → reloads the systemd service.
3. **Upload scheduling.** n8n watches the Puter KV store for "ready to upload" flags → triggers rclone upload to R2 → updates the FFmpeg playlist.
4. **Cross-posting (future).** n8n publishes Short Moments to TikTok / Reels / Shorts via their APIs (where available) or via browser automation.
5. **Stream health monitoring.** n8n polls YouTube Live API every 5 min → if stream health drops, sends a Telegram alert to the operator.

### Why n8n, not Zapier / Make
- **n8n is self-hosted.** No per-execution cost. No vendor lock-in. The workflow definitions are JSON files in the repo.
- **n8n is open-source.** The community contributes nodes for every platform.
- **n8n runs on the same VPS as FFmpeg.** Single host, no external dependencies.

### Why n8n, not custom scripts
- **Visual editor.** The producer (a non-developer) can edit workflows in the browser.
- **Pre-built nodes.** YouTube API, Telegram, ImageMagick, R2, HTTP — all have nodes. No custom OAuth dance.
- **Error handling.** n8n retries failed nodes + sends alerts.

---

## 5. Hardware Assessment

### The current inventory

| Device | Specs | Capability | Role |
|--------|-------|------------|------|
| **Xeon / GTX 1050Ti Desktop** | Xeon CPU, 4 GB VRAM (1050Ti), NVENC hardware encoder. | Stable 720p / 1080p recording via OBS. NVENC is the key — it offloads encoding from the CPU to the GPU. | **Primary recording machine.** All Mode 1 (live) sessions record here. |
| **N3710 HP Laptop (8 GB RAM)** | Intel Pentium N3710, broken QuickSync, 100% CPU at any resolution. | UNUSABLE for recording — QuickSync is broken, CPU saturates instantly. | **VPS management + browser tasks.** The N3710 can run a browser, edit Puter files, manage the VPS via SSH. It cannot record. |
| **"Slightly Stronger" Laptop** | CPU generation unknown — needs verification. | If 6th-gen Intel (Skylake, 2015) or newer with functional QuickSync → viable as a low-power secondary recorder. If older → unusable. | **Potential secondary recorder** (if viable). Would reduce desktop power-on time. |
| **2013 MacBook Air** | Browser-only capability. | Lightweight — VPS management, Canva, content planning. | **Producer's machine.** The producer uses this for scheduling, thumbnail design, community management. |
| **Existing phones** | High-quality cameras (modern phones exceed $30–50 webcams in image quality). | Multi-camera production via DroidCam USB. | **Multi-camera webcams.** Each phone is a camera angle; DroidCam USB feeds them to OBS. |

### Hardware limitations + mitigations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| N3710 laptop unusable for recording. | No low-power recording option — the 1050Ti desktop must be used for all recording sessions. | 1) Verify the "slightly stronger" laptop's CPU generation. If Skylake+, it becomes the low-power recorder. 2) Batch record 1–2 sessions per week to minimize desktop power-on time. 3) Record during off-peak electricity hours if time-of-day billing applies. |
| Xeon / 1050Ti desktop power consumption. | ~150–200 W under recording load. Approximately Ksh 1,400–1,800/month if recording 8 hours daily. | 1) Batch recording reduces hours. 2) Use the second laptop if QuickSync works. 3) Record at 720p with minimal OBS preview to reduce GPU load. |
| No dedicated webcam or microphone. | Phones serve as cameras + mics. Effective but consumes phone batteries + ties up devices. | 1) Phones are adequate (better than budget webcams). 2) First hardware purchase: USB condenser microphone ($25–45) — dramatically improves audio. 3) Second purchase: budget webcam as a backup when phones are unavailable. |
| Limited local storage. | N3710 has 256 GB; MacBook Air likely limited. | 1) Puter.com shared cloud drive as central storage. 2) Cloudflare R2 for video archives. 3) Local devices only need browser access. |

### The hardware upgrade path (when revenue allows)

The recommended upgrade sequence, prioritized by impact-per-dollar:

1. **USB condenser microphone ($25–45).** Audio quality is the single biggest perceivable upgrade. The phones-as-mics setup works but a dedicated mic elevates the production value immediately.
2. **VPS upgrade to 8 GB RAM ($10/month more).** Enables 1080p streaming instead of 720p. The visual jump from 720p to 1080p is significant on modern displays.
3. **Budget webcam ($15–30).** A backup for when phones are unavailable. Not a primary camera — phones are still better.
4. **Used GPU for local AI ($80–150).** A used GTX 1660 or RTX 2060 enables local Stable Diffusion for AI thumbnail generation + local whisper.cpp for transcription. Reduces dependency on Puter.js's free AI limits.

---

## 6. Production Toolkit (Zero-Budget Stack)

### Recording
- **OBS Studio** — screen + camera + mic recording. NVENC hardware encoder on the 1050Ti. Free + open-source.
- **Deriv MT5 Web Terminal** — the trading platform on screen. Browser-based, no installation. Clean UI for the W21 overlay. Free.
- **DroidCam USB** — phones as webcams. Better quality than $30–50 budget webcams. Multi-camera support. Free.
- **SpeakerSplit.ai** — AI voice separation from a single room mic. Replaces multi-device recording. Free.
- **Wireless earbuds** — for monitoring only. NOT for recording (Bluetooth latency causes sync issues).

### Editing
- **CapCut (browser)** — free, 120-min support, AI silence removal, auto-captions, no watermark. Primary editor.
- **Shotcut (desktop)** — free, open-source, runs on 4 GB RAM. Offline fallback when CapCut is unavailable.
- **SamurAIGPT** — open-source AI clip extraction. For Short Moments.

### Thumbnails
- **Canva** — free, W21 brand kit upload (logo, colors, fonts). Primary thumbnail designer.
- **Fliki** — free AI thumbnail generation, no sign-up, no watermark, GPT Image 2.
- **Braiv** — free, auto-generates thumbnails from video transcripts.
- **ImageMagick + n8n** — programmatic thumbnail generation from W21 templates. Fully localhost pipeline.

### AI capabilities (all free via Puter.js)
- Claude / GPT access for captions, summaries, descriptions, content analysis.
- No API keys, no billing, no backend required.
- $10 paid tier available if AI usage exceeds free limits.

### Streaming
- **FFmpeg** — open-source. The 24/7 VPS loop engine.
- **OBS Studio** — open-source. The live-session encoder.
- **YouTube Live** — free ingest. The primary distribution platform.

### Storage + automation
- **Cloudflare R2** — 10 GB free tier, zero egress. Large video archive.
- **Puter.com + Puter.js** — free cloud desktop + KV store + AI APIs. Small files + collaboration.
- **n8n** — self-hosted workflow automation. Thumbnail generation, content refresh, upload scheduling.

### Monthly cost breakdown

| Item | Monthly cost |
|------|--------------|
| VPS (operator's existing or new 4 GB) | $0–16 |
| Cloudflare R2 (10 GB free tier) | $0 |
| CapCut (free tier) | $0 |
| DroidCam (free) | $0 |
| SpeakerSplit.ai (free) | $0 |
| Canva / Fliki (free tiers) | $0 |
| OBS Studio (open-source) | $0 |
| FFmpeg (open-source) | $0 |
| n8n (self-hosted, open-source) | $0 |
| Puter (free cloud desktop + JS SDK) | $0 |
| **Total** | **$0–16/month** |

---

## 7. Smile Live Kit Deployment For W21 Trading

### Pattern 3 — Hybrid (recommended for 24/7)

From `docs/handoff/07-OBS_INTEGRATION.md` §"Deployment Patterns":

- Smile Live Kit is deployed on Vercel for the console + the live-session scenes.
- For the 24/7 fill blocks (Mode 2), FFmpeg on the VPS loops pre-recorded VOD that already includes the W21 branding baked in (recorded with Smile Live Kit scenes overlaying the trading screen during the live session). The Smile Live Kit scenes are NOT live during fill — they're baked into the VOD.

### The deployment topology

```
┌──────────────────────────────────────────────────────────────┐
│  Vercel (smile-live-kit.vercel.app)                          │
│  ├─ /  (the control console)                                 │
│  ├─ /scenes/trading-live (live-session scene)                │
│  ├─ /overlays/ticker (live ticker overlay)                   │
│  └─ /api/* (market data, scene presets, schedule)            │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │ OBS Browser Source (live blocks only)
                              │
┌──────────────────────────────────────────────────────────────┐
│  Operator's Machine (Xeon / 1050Ti desktop, Kenya)           │
│  ├─ OBS Studio (NVENC encoder)                               │
│  │   ├─ Browser Source: smile-live-kit.vercel.app/scenes/... │
│  │   ├─ Video capture: DroidCam phones                       │
│  │   └─ Audio capture: USB mic / SpeakerSplit.ai             │
│  └─ RTMP output → YouTube Live (live blocks)                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ (recorded MP4 uploaded to R2)
┌──────────────────────────────────────────────────────────────┐
│  VPS (Data Center — 4 GB RAM, $10–16/month)                  │
│  ├─ FFmpeg loop (24/7 fill blocks)                           │
│  │   └─ -stream_loop -1 -re -i <R2-video-url> → YouTube RTMP │
│  ├─ n8n (automation)                                         │
│  ├─ Puter.js KV store (content calendar, journal)            │
│  └─ Watchdog + systemd (auto-recovery)                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  YouTube Live (the 24/7 stream viewers watch)                │
└──────────────────────────────────────────────────────────────┘
```

### The transition between modes (revisited)
- **Mode 1 → Mode 2:** Operator ends the OBS stream. The VPS watchdog detects YouTube Live go idle → starts the FFmpeg loop within 5 seconds. The transition is a brief (~5 sec) "Be Right Back" card on YouTube, then the pre-recorded content resumes.
- **Mode 2 → Mode 1:** Operator starts the OBS stream (same YouTube stream key). The VPS watchdog detects the new RTMP connection from OBS → kills the FFmpeg process. The transition is a brief (~5 sec) cut to the live scene.

---

## 8. Risk + Mitigation (Technical)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| VPS outage (provider-side) | Low | High (stream goes dark) | Choose a provider with a strong uptime SLA (Hetzner, DigitalOcean). Monitor via n8n (every 5 min). Failover: a backup VPS image at a second provider, manually activated. |
| FFmpeg crash | Medium (memory leaks over weeks) | Medium (brief outage) | `Restart=always` in systemd. Watchdog script checks every minute. |
| YouTube RTMP endpoint change | Low | High | YouTube rarely changes ingest endpoints. Monitor YouTube's developer blog. The stream key is the only volatile piece. |
| Cloudflare R2 outage | Low | Medium (no new content) | The VPS has a local cache of the current week's videos. R2 outage blocks new uploads, not the live stream. |
| Operator's internet outage during a live block | Medium (Kenya) | Medium (live block interrupted) | Mode 2 (VPS loop) takes over within 5 seconds of the OBS stream dropping. The live block is truncated; the fill block resumes. The operator can re-join when connectivity returns. |
| Hardware failure (1050Ti desktop) | Low | Medium (no live blocks until repaired) | The VPS loop keeps the 24/7 stream alive. Live blocks are suspended until the desktop is repaired or a backup machine is configured. |

---

*Next: [`LAUNCH_ROADMAP.md`](LAUNCH_ROADMAP.md) for the Phase 0–4 execution plan + milestones + risk matrix + monetization sequence.*
