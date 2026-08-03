# W21 Trading — Vertical Overview

> **W21 │ TRADING** is the launch channel of the World 21 (W21) ecosystem — a 24/7 YouTube live-streaming channel focused on synthetic-indices trading education for the Kenya/East Africa region and a global audience. This directory contains the strategic, content, technical, and launch documentation for the channel.

---

## Why This Vertical Drives Smile Live Kit

Smile Live Kit is the broadcast-graphics layer for the W21 ecosystem. W21 Trading is its first consumer. Every v2 feature in Smile Live Kit traces back to a requirement in this vertical:

- The `/scenes/trading-live` route renders the W21 Trading on-air scene.
- The ticker's default symbol set is the Deriv synthetic-indices set (V10, V25, V50, V75, V100, Step Index, Range Break, Boom & Crash).
- The 24-hour programming grid (in the console's `SchedulePanel`) is the W21 Trading grid.
- The curriculum-ladder scene presets map to the 5 modules (Step Index → V100).
- The hybrid streaming model (browser studio for live sessions + VPS FFmpeg for 24/7 fill) is the deployment target.

If you're working on a Smile Live Kit feature and wondering "why this?", the answer is probably in one of the four documents below.

---

## The Four Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| [`STRATEGIC_BRIEF.md`](STRATEGIC_BRIEF.md) | The executive vision: what W21 Trading IS, the market gap (first-in-category 24/7 trading education), the UVP, the competitive landscape, the SWOT. Written to international broadcast-network standards (Bloomberg × CNBC × Kenyan authenticity). | Stakeholders, the human, any AI starting work on a Trading-vertical feature. |
| [`CONTENT_STRATEGY.md`](CONTENT_STRATEGY.md) | The 24-hour programming grid (EAT/UTC+3), the curriculum ladder (Step Index → V10 → V25 → V50 → V75 → V100), the short-form funnel (Short Moments → TikTok/Reels/Shorts → 24/7 stream → community). | The on-air talent, the producer, the Smile Live Kit scheduler implementer. |
| [`TECHNICAL_INFRASTRUCTURE.md`](TECHNICAL_INFRASTRUCTURE.md) | The VPS streaming model (Record → Edit → Cloudflare R2 → VPS FFmpeg loop → YouTube Live), the hybrid model (Mode 1: browser studio for live; Mode 2: VPS FFmpeg for 24/7 fill), the storage architecture (R2 + Puter), the automation (n8n), the hardware assessment. | The technical operator, the Smile Live Kit deployment engineer. |
| [`LAUNCH_ROADMAP.md`](LAUNCH_ROADMAP.md) | Phase 0-4 with timelines, milestones, risk matrix, monetization sequence. | The project lead, the human. |

---

## Source Material

The four documents were refined from three raw "childish sketch" debriefs (preserved in `/upload/`, gitignored):

1. `W21_Trading_Full_Debrief_for_AI.md` (382 lines) — the original AI handoff dump.
2. `W21_Trading_Comprehensive_Debrief.md` (434 lines) — a peer/stakeholder review draft.
3. `W21_Trading_Strategic_Debrief.html` (1402 lines) — a visual presentation deck.

The raw debriefs were substantive but stylistically uneven — alternately informal and over-caffeinated, with emoji-heavy bullet points and inconsistent terminology. The refined docs in this directory preserve every factual claim, every research citation, and every strategic decision from the raw material, but rewrite the presentation to international broadcasting-standard maturity: precise, professional, no hype words. Cite the research sources where the raw debriefs did.

---

## The Channel At A Glance

| Attribute | Value |
|-----------|-------|
| Channel name | W21 │ TRADING |
| Brand color | Signal Cyan `#00F0FF` |
| Parent brand | smile.co.ke / World 21 (Unity Gold `#F5A623`) |
| Format | 24/7 live YouTube stream (pre-recorded loop with periodic live sessions) |
| Subject | Synthetic-indices trading education (Deriv) + forex ( Twelve Data) |
| Audience | Kenya / East Africa + global retail traders |
| Language | English (Kiswahili segments future) |
| Curriculum | 5 modules: Step Index → V10 → V25 → V50 → V75 → V100 |
| Operational cost | $0–16/month (zero-budget stack on existing hardware + free tools) |
| Launch status | Pre-launch — Phase 0 ready |

---

## How Smile Live Kit Implements This Vertical

| Smile Live Kit feature | W21 Trading requirement | Source doc |
|------------------------|--------------------------|------------|
| `/scenes/trading-live` route | The on-air live trade scene | `STRATEGIC_BRIEF.md` §UVP + `CONTENT_STRATEGY.md` §24-hr grid |
| Ticker with Deriv synthetic-indices symbols | Live V75/V100/etc. prices on-air | `TECHNICAL_INFRASTRUCTURE.md` §Market Data + `CONTENT_STRATEGY.md` §Curriculum Ladder |
| 24-hr programming grid auto-pilot | SchedulePanel switches scenes on the 8-block grid | `CONTENT_STRATEGY.md` §24-Hour Programming Grid |
| Curriculum-ladder scene presets (5 modules) | Step Index → V100 scene variants | `CONTENT_STRATEGY.md` §Curriculum Ladder |
| Hybrid deployment (Vercel + VPS FFmpeg) | Live sessions via Smile Live Kit; fill via FFmpeg VOD loop | `TECHNICAL_INFRASTRUCTURE.md` §Hybrid Model |
| "Recorded Session" / "Lesson Replay" labeling | Transparency per YouTube July 2025 policy | `STRATEGIC_BRIEF.md` §Risk & Mitigation |
| Channel selector defaults to "trading" | Trading is the launch channel | This doc |

---

*Read [`STRATEGIC_BRIEF.md`](STRATEGIC_BRIEF.md) first for the executive vision, then [`CONTENT_STRATEGY.md`](CONTENT_STRATEGY.md) for the programming, then [`TECHNICAL_INFRASTRUCTURE.md`](TECHNICAL_INFRASTRUCTURE.md) for the streaming architecture, then [`LAUNCH_ROADMAP.md`](LAUNCH_ROADMAP.md) for the execution plan.*
