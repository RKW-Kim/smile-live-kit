# Research Index

> Catalog of all research, scraped data, vertical specifications, and OBS-parity references. This is the project's knowledge base — every feature decision in Smile Live Kit traces back to a source here.

---

## 📊 W21 Trading Vertical Research (docs/verticals/w21-trading/)

Six comprehensive research sessions — branding, market analysis, content strategy, technical infrastructure, hardware assessment, operational workflow — fully synthesized into four mature documents. **Every Smile Live Kit feature tied to the W21 Trading launch channel should cite these.**

| File | Topic | Original Source |
|------|-------|-----------------|
| `README.md` | Overview of the W21 Trading vertical + how it informs Smile Live Kit | Synthesized |
| `STRATEGIC_BRIEF.md` | Executive vision, market gap, UVP, SWOT, competitive landscape — international broadcasting standard | Synthesized from 3 raw debriefs (Full, Comprehensive, Strategic HTML) |
| `CONTENT_STRATEGY.md` | 24-hr programming grid (EAT/UTC+3), curriculum ladder (Step Index → V100), short-form funnel | Synthesized + Entri/TakeProfitApp/AWISee research |
| `TECHNICAL_INFRASTRUCTURE.md` | VPS+FFmpeg streaming model, hybrid Mode 1/Mode 2, R2+Puter storage, n8n automation, hardware assessment | Space-Node.net, Cloudflare R2 docs, Puter docs, EaseUS 2026 |
| `LAUNCH_ROADMAP.md` | Phase 0–4 with timelines, milestones, risk matrix, monetization sequence | Synthesized |

**Why it matters:** Smile Live Kit's `/scenes/trading-live` route, the control console's ticker editor, the curriculum-ladder scene presets, and the 24-hour programming grid are all derived from these documents. Cite the section when implementing.

### Raw debriefs (pre-refinement, in `/upload/` — gitignored, not in the repo)

The three "childish sketch" debriefs that were refined into the four docs above:
- `W21_Trading_Full_Debrief_for_AI.md` (382 lines) — original AI handoff dump
- `W21_Trading_Comprehensive_Debrief.md` (434 lines) — peer/stakeholder review draft
- `W21_Trading_Strategic_Debrief.html` (1402 lines) — visual presentation deck

The refined docs in `docs/verticals/w21-trading/` supersede these. The raw files are preserved in `/upload/` (gitignored) for traceability; if you need the original wording of a research finding, ask the human.

---

## 📡 OBS Parity Research

### OBS Studio core features (the structural benchmark)
- **Source:** [obsproject.com](https://obsproject.com) + [OBS Studio docs](https://obsproject.com/wiki/)
- **What it gives us:** Browser Source, Scene Collections, Source Transforms (position/scale/rotation/crop), Audio Mixer (per-source volume/mute/sync-offset), Filters (chroma-key, color-correction, sharpen, blur, noise-suppression, noise-gate, compressor), Replay Buffer, Studio Mode (preview/program), Transitions (cut/fade/stinger/luma), Source locking/hiding, Hotkeys, Statistics, Profile/SLO management, Multiview, Dockable Panels, Stream/Recording settings.
- **Where it's tracked:** [`handoff/09-FEATURES.md`](handoff/09-FEATURES.md) — the parity matrix.

### OBS community plugins (the "extra features" benchmark)
- **OBS WebSocket** — programmatic scene control; informs our Socket.io transport model (see [`handoff/11-TRANSPORT_REALTIME.md`](handoff/11-TRANSPORT_REALTIME.md)).
- **StreamFX** — source filters, blur, advanced shaders; informs our filter roadmap.
- **Advanced Scene Switcher** — auto-scene-switching on time/window/file; informs our 24-hr programming grid auto-pilot.
- **Source Record** — per-source recording; informs our segment-capture for short-form clips.
- **Move Transition** — animated source moves between scenes; informs our transition store.
- **Input Overlay** — keyboard/controller overlay; potential overlay route.
- **Scene Note** — operator notes on scenes; informs our console's scene-card annotations.

### Streaming software comparisons (parity + competitive)
- **Streamlabs Desktop** — extra features (Cloudbot, merch, themes, multistream). Smile Live Kit does NOT target Streamlabs parity directly — the kit extends OBS, not Streamlabs.
- **vMix / Wirecast / Tricaster** — professional broadcast switchers. Reference for UI density + multi-input handling. We are NOT aiming for vMix parity.
- **Meld Studio** — emerging browser-based studio. Watch for feature inspiration, not parity.

---

## 🎨 Brand & Identity Research

### W21 brand system
- **Source:** [`brand/IDENTITY_SYSTEM.md`](brand/IDENTITY_SYSTEM.md) — the brand bible.
- **Origin:** Designed externally (the user's prompt + 8 generation prompts). Smile Live Kit implements it as code in `src/components/w21/` + `src/lib/w21/channels.ts`.
- **What it gives us:** the 6 brand rules (mark sacred, color differentiator, channel name white, gold parent, monospaced numbers, grid never sleeps), the channel color map (12 channels + parent), the system colors (Terminal Black, Grid White, Zinc, Alert Magenta), the typography (JetBrains Mono + Geist Sans), the structural grid principle, usage examples (favicon / watermark / stream overlay / banner), and the "never do" list.

### Reference identities (inspiration, not parity)
- **Bloomberg Terminal** — the dark + amber + monospaced aesthetic for trading readouts.
- **CNBC on-air graphics** — ticker design, lower-thirds, segment bumpers.
- **Reuters Eikon** — institutional newsroom UI density.
- **Apple TV+ / Netflix UI** — restrained, dark, content-first composition.
- **Linear / Raycast / Vercel dashboard** — premium dark UI patterns (note: Smile Live Kit's dark theme predates and is independent of these; alignment is incidental).

---

## 🛠 Technical Research (cited in the handoff docs)

### Streaming + encoding
- **FFmpeg 24/7 streaming commands** — Space-Node.net (2026 guide) + dev.to case studies. Cited in [`verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md`](verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md).
- **VPS auto-recovery (systemd + watchdog)** — Space-Node.net (2026 Complete Guide).
- **OBS optimization for low-end hardware** — EaseUS (2026), OBS Forums.

### Market data
- **Deriv API** — synthetic indices WebSocket + REST API. Cited in [`handoff/10-DATA_FEEDS.md`](handoff/10-DATA_FEEDS.md).
- **Twelve Data** — forex/equities REST API, free tier. Cited in same.
- **Budget-gating pattern** — switch provider based on a daily-call budget, fall back to a cached/simulated stream when the budget is exhausted.

### Storage + automation
- **Cloudflare R2** — large video file storage (10GB free tier, zero egress). Cited in [`verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md`](verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md).
- **Puter.com + Puter.js** — free cloud desktop + KV store + AI APIs. Cited in same.
- **n8n** — self-hosted workflow automation for thumbnail generation, content refresh, upload scheduling.

### Production toolkit (zero-budget)
- **CapCut (browser)** — free 120-min video editing, AI silence removal, auto-captions, no watermark.
- **DroidCam USB** — phones as webcams via OBS plugin.
- **SpeakerSplit.ai** — free AI voice separation from a single room mic.
- **Fliki / Braiv / Canva** — thumbnail generation.
- **SamurAIGPT** — open-source AI clip extraction.

### YouTube platform
- **YouTube July 2025 policy** — protects value-adding commentary + educational content; penalizes spammy loops. Cited in [`verticals/w21-trading/STRATEGIC_BRIEF.md`](verticals/w21-trading/STRATEGIC_BRIEF.md) §"Risk & Mitigation".
- **YouTube algorithm + 24/7 streams** — Nerdbot (2025), Gyre.pro, Resi.io. 24/7 streams accumulate watch time at 24× a daily streamer's rate.
- **YouTube SEO for synthetic indices** — flagged as a research gap (see [`verticals/w21-trading/LAUNCH_ROADMAP.md`](verticals/w21-trading/LAUNCH_ROADMAP.md)).

---

## 🔗 How Research Informs Features

Every feature in [`handoff/09-FEATURES.md`](handoff/09-FEATURES.md) traces to research:

- **Scene routes at 1920×1080 with transparent bodies** → OBS Browser Source spec (OBS parity).
- **Console → scene transport via Socket.io** → OBS WebSocket protocol pattern (community plugin parity).
- **Ticker editor in the console** → Bloomberg / CNBC ticker pattern + Deriv/Twelve Data feeds (market data research).
- **24-hr programming grid auto-pilot (roadmap)** → Advanced Scene Switcher + W21 Trading 24-hr grid (`verticals/w21-trading/CONTENT_STRATEGY.md`).
- **Curriculum-ladder scene presets (roadmap)** → W21 Trading curriculum ladder (`verticals/w21-trading/CONTENT_STRATEGY.md`).
- **W21 mark + channel color map** → W21 brand system (`brand/IDENTITY_SYSTEM.md`).
- **Tally indicators (red/green/amber)** → OBS Studio Mode tally convention (OBS parity).
- **Scene Collections export to OBS JSON (roadmap)** → OBS scene collection format (OBS parity).

---

## 📋 Using This Index

### For a new AI:
1. Before building a feature, check if research exists here or in `docs/verticals/`.
2. Cite the research in your worklog entry ("informed by `verticals/w21-trading/CONTENT_STRATEGY.md` §2 — 24-hr programming grid").
3. If you do NEW research (web search, scraping, analysis), add it to `docs/research/` and update this index.

### For a human:
1. Curious why a feature exists? Find its research source here.
2. Want to add a feature? Check the research first — it may already be analyzed.
3. The W21 Trading vertical research is the deepest — most Smile Live Kit features in v2 trace back to it.

---

## 🗄️ Research Gaps (priority for future sessions)

Drawn from the W21 Trading debriefs — these have NOT been fully researched yet:

| Priority | Topic | Why It Matters |
|----------|-------|----------------|
| 🔴 Critical | YouTube monetization policies for 24/7 pre-recorded streams | Determines revenue timeline |
| 🔴 Critical | Deriv affiliate program details + commission rates | Primary zero-cost monetization at launch |
| 🔴 High | Legal disclaimers + compliance (Kenya/East Africa) | Risk protection before first video |
| 🟡 High | Community building best practices (Telegram/WhatsApp/Discord) | Audience retention + conversion |
| 🟡 Medium | YouTube SEO keyword strategy for synthetic indices | Discoverability |
| 🟡 Medium | Multi-platform streaming configuration (FFmpeg multi-RTMP) | Expanded reach at zero cost |
| 🟢 Lower | M-Pesa payment integration for tips/donations | Local monetization |
| 🟢 Lower | Automated social media cross-posting tools (free) | Efficiency for short-form distribution |

---

*This index is the project's knowledge map. Keep it updated as research grows.*
