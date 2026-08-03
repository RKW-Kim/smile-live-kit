# W21 Trading — Launch Roadmap

> The phased plan to take W21 │ TRADING from pre-launch to a self-sustaining 24/7 trading-education broadcast. Written to international broadcasting-project standards: each phase has a definition-of-done, exit criteria, and a risk-gate the operator must clear before advancing.

---

## 1. Guiding Principles

1. **Ship the plane, then add the engines.** The 24/7 loop goes live before every scene is perfect. A working stream with 3 scenes beats a perfect stream that never launches.
2. **The stream is the product.** Every artifact (scene, overlay, alert, short-form clip) exists to serve the live broadcast. If a feature doesn't improve the viewer's experience of the stream, it's deferred.
3. **OBS is the gold standard.** We build HTML scenes/overlays that render in OBS Browser Sources. We do not reinvent OBS. We fill the gaps OBS leaves (W21 branding, live market data, grandma-operable control).
4. **Zero-budget is a constraint, not a limitation.** Every tool in the stack is free or under $16/month. The constraint forces institutional discipline (automation, templates, proven solutions over bespoke code).
5. **Transparency is the moat.** Label pre-recorded content as "Recorded Session." Distinguish live blocks from looped content. The audience trusts a channel that doesn't pretend.

---

## 2. Phase Overview

| Phase | Timeline | Theme | Exit Criteria |
|-------|----------|-------|---------------|
| **Phase 0** | Weeks 1–2 | Pre-launch infrastructure | Channel created, first batch recorded, stream tested end-to-end for 2 hours, assets branded. |
| **Phase 1** | Weeks 3–4 | Soft launch (8-hour loop) | 24/7 stream live with 8-hour rotating loop, retention data gathered, first 50 subscribers. |
| **Phase 2** | Months 2–3 | Full programming grid | 24-hour grid operational, short-form funnel active, weekly content refresh, Deriv affiliate live. |
| **Phase 3** | Months 4–6 | Community & monetization | Periodic real-time live sessions, memberships opening, M-Pesa donations active, 1,000 subscribers. |
| **Phase 4** | Months 7–12 | Ecosystem expansion | W21 │ EDUCATION launched, forex integrated, multi-platform streaming, 4,000 watch-hours (YPP eligible). |

---

## 3. Phase Detail

### Phase 0 — Pre-Launch Infrastructure (Weeks 1–2)

**Objective:** Validate the entire pipeline (record → edit → store → VPS → YouTube) with a single test stream before committing to 24/7.

**Workstreams:**
- **Channel:** Create the YouTube channel, brand it with the W21 │ TRADING lockup (cyan), write channel description with the "Signals · Education · Freedom" positioning, set up channel banner (Prompt 08 spec).
- **Brand assets:** Generate the W21 universal mark (favicon, watermark, profile picture), the channel banner, the stream overlay scene (`/scenes/trading-live` — already built in v2), and 3 thumbnail templates.
- **Content batch:** Record the first 8 hours of content following the curriculum ladder (Step Index basics, V10 mechanics, V25 analysis). Edit in CapCut (silence removal, auto-captions). Export at 720p (NVENC on the 1050Ti).
- **Infrastructure:** Provision the VPS (Dad's existing VPS if 4GB+ RAM, or a $10–16/month KVM). Install FFmpeg. Write the systemd service + watchdog script. Test the loop command: `ffmpeg -stream_loop -1 -re -i video.mp4 -c copy -f flv rtmp://...`.
- **Storage:** Set up Cloudflare R2 (10GB free tier). Upload the first batch via rclone. Verify the VPS can pull from R2.
- **OBS setup:** Configure the OBS scene collection on the recording desktop. Add the W21 Browser Sources (control panel at `/`, scene at `/scenes/trading-live`). Map hotkeys (Ctrl+Alt+F1–F5 for scene switching).
- **Smoke test:** Run a 2-hour private test stream. Verify: video plays, audio is clean, overlays render, the clock ticks, no dropped frames, VPS survives a manual kill (watchdog restarts).

**Definition of Done:**
- [ ] YouTube channel live and branded.
- [ ] ≥8 hours of edited content in R2.
- [ ] VPS streaming pipeline verified for 2 continuous hours.
- [ ] OBS scene collection imports cleanly on the recording machine.
- [ ] W21 control console (`/`) loads and switches scenes via the preview panel.

**Risk Gate:** If the VPS can't sustain 720p streaming without dropped frames, downgrade to 480p or upgrade the VPS before Phase 1. Do not launch 24/7 on an unstable pipeline.

---

### Phase 1 — Soft Launch (Weeks 3–4)

**Objective:** Go live 24/7 with an 8-hour rotating loop. Gather real retention data. Build the first subscriber base.

**Workstreams:**
- **Go live:** Start the FFmpeg loop on the VPS. Stream the 8-hour batch on repeat. Monitor for the first 48 hours (dropped frames, audio drift, YouTube policy warnings).
- **Transparency:** Add a "RECORDED SESSION" lower-third bug during looped content. Plan the first real-time live block for Week 4.
- **Analytics:** Set up YouTube Studio analytics watching: average view duration, click-through rate (thumbnail effectiveness), traffic sources. The 24/7 format should produce high watch-time even with low concurrent viewers.
- **Community:** Create the Telegram channel (preferred over Discord for the East African audience). Pin the stream link. Post the daily programming grid.
- **Short-form:** Extract 3–5 "Short Moments" (30–60s clips) from the first batch using CapCut. Post to TikTok, Reels, Shorts. Funnel to the 24/7 stream via the channel link.
- **Affiliate:** Register for the Deriv affiliate program. Add the affiliate link to the channel description + a lower-third callout during education blocks.

**Definition of Done:**
- [ ] 24/7 stream running continuously for ≥10 days without manual intervention.
- [ ] First 50 subscribers.
- [ ] Retention data collected (average view duration ≥ 3 minutes target).
- [ ] Telegram community launched.
- [ ] First 5 short-form clips published.

**Risk Gate:** If YouTube flags the stream for "repetitive content" (24/7 pre-recorded policy), add more content variety to the loop OR schedule periodic real-time live blocks to satisfy the "live" signal. See the risk matrix below.

---

### Phase 2 — Full Programming Grid (Months 2–3)

**Objective:** Operate the full 24-hour programming grid. Weekly content refresh. Short-form funnel at scale.

**Workstreams:**
- **24-hour grid:** Implement the full programming grid (see `CONTENT_STRATEGY.md`). Expand the content library to 24 hours. Set up the n8n automation to refresh the FFmpeg playlist weekly.
- **Real-time live blocks:** Schedule 2–3 real-time live trading sessions per week (London session 12:00–14:00 EAT, Prime time 18:00–20:00 EAT). Use the browser-based broadcasting studio (in separate development) OR OBS + DroidCam for these blocks. Record → edit → feed into the loop.
- **Scene expansion:** Build the remaining W21 scenes: `/scenes/starting-soon`, `/scenes/break`, `/scenes/news`, `/scenes/education`, `/scenes/ending`. Wire them into the control console.
- **Market data:** Integrate live market data into the ticker + signal panel (Twelve Data API, budget-gated to US market hours at 1/min). See `docs/handoff/10-DATA_FEEDS.md`.
- **Thumbnail system:** Template the thumbnail generation in n8n + ImageMagick. Auto-generate from the W21 brand system.
- **Monetization:** Activate Deriv affiliate. Begin M-Pesa donation integration (STK push). First revenue (even $5) validates the model.

**Definition of Done:**
- [ ] Full 24-hour grid operational with weekly refresh.
- [ ] ≥2 real-time live sessions per week.
- [ ] All 7 W21 scenes built and wired to the control console.
- [ ] Live market data flowing into the ticker.
- [ ] First affiliate commission received.

**Risk Gate:** If content production can't keep pace with weekly refresh (team burnout), reduce the grid to a 12-hour loop or batch-record monthly.

---

### Phase 3 — Community & Monetization (Months 4–6)

**Objective:** Build the community. Open monetization channels. Reach YouTube Partner Program thresholds.

**Workstreams:**
- **Community:** Weekly community calls (puTalk or Telegram voice). Q&A sessions. Member-only signal reviews.
- **Memberships:** Open YouTube Memberships (requires YPP). Tier 1: member-only signals. Tier 2: direct line to the trader.
- **Premium content:** After establishing a 3-month track record, launch a premium signals/course offering (M-Pesa + card). Price for the East African market (Ksh. 500–2,000/month).
- **Multi-platform:** Begin simulcasting to Twitch/Kick via FFmpeg multi-RTMP. Diversifies platform risk.
- **Live events:** Host a monthly live trading masterclass (real-time, not looped). This is the "authenticity anchor" that keeps the channel from feeling like a content farm.

**Definition of Done:**
- [ ] 1,000 subscribers (YPP threshold).
- [ ] 4,000 public watch-hours in 12 months (YPP threshold — 24/7 streaming accelerates this dramatically).
- [ ] YouTube Memberships open.
- [ ] Monthly live masterclass established.

**Risk Gate:** If the channel isn't growing (stuck under 500 subscribers at Month 5), audit: thumbnail CTR, short-form funnel conversion, content quality. Pivot the content mix before pushing monetization.

---

### Phase 4 — Ecosystem Expansion (Months 7–12)

**Objective:** Launch the next W21 channel. Integrate forex. Scale toward the multi-channel vision.

**Workstreams:**
- **W21 │ EDUCATION:** Launch the second channel (Knowledge Blue accent). Structured course content (beginner → advanced) separated from the live trading channel.
- **Forex integration:** Expand beyond synthetic indices into forex (EUR/USD, GBP/JPY, XAU/USD). Requires the London/New York session alignment.
- **Browser studio:** If the separate browser-based broadcasting studio project is production-ready, migrate live blocks to it (eliminates the OBS dependency for live sessions; the VPS loop continues for 24/7 fill).
- **Brand systemization:** Complete the W21 scene/overlay component library so launching a new channel is a config change (channel color + content), not a build effort.
- **Partnerships:** Formalize the Deriv partnership. Explore additional broker affiliations (Exness, FBS for the EA market).

**Definition of Done:**
- [ ] W21 │ EDUCATION launched and streaming.
- [ ] Forex content in the regular rotation.
- [ ] The W21 scene/overlay kit is config-driven (new channel = new color + content, zero code).
- [ ] Sustainable monthly revenue (affiliate + memberships + donations) covering VPS + tooling costs.

---

## 4. Risk Matrix

| Risk | Probability | Impact | Mitigation | Trigger to Act |
|------|------------|--------|------------|----------------|
| YouTube policy change on 24/7 pre-recorded streams | Low–Med | High | Multi-platform (Twitch, Kick); transparency labeling; periodic real-time live blocks | Any policy announcement OR a channel warning strike |
| Competitor copies the 24/7 model | Medium | Medium | Brand moat (W21 system); first-mover community; content depth | A competing channel launches 24/7 trading education |
| Deriv platform changes (synthetic indices rules) | Low | Medium | Curriculum built on principles, not platform specifics; multi-asset readiness | Deriv announces index changes |
| AI content flood dilutes the niche | High | Low | Human expertise + community are the differentiator; emphasize the live + interactive elements | Watch-time drop correlates with AI-content volume |
| Electricity/internet cuts (Kenya) | Medium | Low (stream) | VPS in a data center is immune; uploads queued; batch recording creates buffer | Recurrent local outages > 4 hours |
| Hardware failure (1050Ti desktop) | Low | Medium | VPS is the critical path, not local hardware; phones (DroidCam) as backup recorders | GPU encoder errors OR system instability |
| Team unavailability (burnout, illness) | Medium | Medium | Batch recording (4-week buffer); pre-recorded model reduces daily demands | Any team member offline > 1 week |
| Content production can't sustain weekly refresh | Medium | Medium | Reduce to 12-hour loop; batch-record monthly; automate via n8n | Content library drops below 16 hours |
| Market data API budget exceeded | Low | Low | Budget-gate to 1/min during US hours; cache ticks; mock data for off-hours | Twelve Data quota warning at 80% |

---

## 5. Monetization Sequence

Revenue is layered, not sequential — each stream starts as early as feasible and compounds:

| Stream | When | Mechanism | Target (Month 12) |
|--------|------|-----------|-------------------|
| **Deriv Affiliate** | Phase 0 (Day 1) | Commission on referred traders | $200–500/month |
| **M-Pesa Donations** | Phase 1 | Direct tips from Kenyan audience (STK push) | $50–150/month |
| **YouTube Partner Program** | Phase 3 (1K subs + 4K hrs) | Ads, Super Chat, Memberships | $100–300/month |
| **Premium Signals/Courses** | Phase 3 (Month 6+) | Monthly subscription (Ksh. 500–2,000) | $300–800/month |
| **Sponsorships** | Phase 4 | Broker sponsorships, tool integrations | $500+/month |

**12-month target:** $1,000–1,800/month gross, against ~$16/month operating cost (VPS). The channel becomes self-sustaining by Month 6 and profitable by Month 9.

---

## 6. Definition of "Launched"

The W21 │ TRADING channel is considered **launched** when ALL of the following are true:

1. The 24/7 stream has run continuously for ≥30 days without a manual restart (watchdog auto-recovery counts).
2. The W21 control console (`/`) is the single operator interface — no direct OBS scene-collection editing during a stream.
3. At least 3 real-time live sessions have been broadcast and recorded.
4. The first affiliate commission has been received (proof the funnel works end-to-end).
5. The Telegram community has ≥100 members.

Everything before this is "pre-launch." Everything after is "operations."

---

## 7. Post-Launch Operating Cadence

| Cadence | Activity |
|---------|----------|
| **Daily** | Check stream status (VPS alive, no dropped frames). Post the day's programming grid to Telegram. |
| **Weekly** | Refresh the content loop. Extract + post 3–5 short-form clips. Review analytics. |
| **Monthly** | Batch-record new content (4–8 hours). Review the curriculum ladder progress. Audit the risk matrix. |
| **Quarterly** | Record new curriculum modules. Review the brand system (any new channel colors needed?). Update this roadmap. |

---

*This roadmap is a living document. Update it at each phase exit. The plan serves the stream, not the other way around.*
