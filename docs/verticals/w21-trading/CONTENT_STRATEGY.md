# W21 │ TRADING — Content Strategy

> **The 24-hour programming grid, the curriculum ladder, and the short-form content funnel.** This document specifies what airs when, how the curriculum is structured, and how short-form content drives discovery of the 24/7 stream.

**Timezone:** All times in **EAT (East Africa Time, UTC+3)** — the primary audience's timezone.
**Grid philosophy:** A 24-hour day, divided into 8 blocks. Each block has a fixed time window, a curriculum focus, and an energy level. The grid is the same every day, with weekly content refreshes.

---

## 1. The Curriculum Ladder

### Overview

The W21 │ TRADING curriculum is a five-module progression from absolute beginner to advanced trader. Each module maps to a Deriv synthetic-indices product tier, so a viewer's curriculum progress aligns directly with the instruments they can practice on.

| Module | Instrument | Volatility | Energy | Pedagogical focus |
|--------|-----------|------------|--------|-------------------|
| **Module 1** | Step Index | Lowest — simulated tick-by-tick price action with controlled volatility. | Low | Chart reading. Candlestick anatomy. Support + resistance. Trend identification. The basics of price-action literacy. |
| **Module 2** | V10 (Volatility 10) | Low — 10% annualized volatility. | Low | First exposure to volatility mechanics. How volatility affects stop-loss placement, take-profit targets, and position sizing. Introduction to the V-index family. |
| **Module 3** | V25 → V50 (Volatility 25, Volatility 50) | Moderate — 25% and 50% annualized volatility. | Medium | Risk management + position sizing. The transition from "I can read a chart" to "I can survive a losing streak." Kelly criterion, fixed-fractional sizing, drawdown management. |
| **Module 4** | Range Break / Boom & Crash | Pattern-based — not volatility-scaled but pattern-driven (range breakouts, spike-and-crash sequences). | Medium | Pattern recognition. Breakout trading. The psychology of FOMO entries and panic exits. |
| **Module 5** | V75 → V100 (Volatility 75, Volatility 100) | High — 75% and 100% annualized volatility. | High | Advanced strategies. Trading psychology under high volatility. Scaling in + scaling out. The transition from "I can trade" to "I can trade professionally." |

### Pedagogical principles

1. **Linear progression.** A complete beginner starts at Module 1 and progresses in order. Each module's prerequisites are the previous module's content.
2. **Drop-in friendly.** An experienced trader can drop in at Module 5 without watching Modules 1–4. Each block is self-contained within its time window.
3. **Instrument-aligned.** The curriculum uses Deriv's actual synthetic-indices products — no simulated proxies. A viewer can open a Deriv demo account and practice the exact instrument the lesson covers.
4. **Principle-based.** The curriculum teaches trading principles (chart reading, risk management, pattern recognition, psychology), not Deriv-specific features. A Deriv platform change forces a tool migration, not a curriculum rewrite.
5. **Energy-coded.** Each module has an energy level (low / medium / high) that determines its time slot in the 24-hour grid. Low-energy content (beginner curriculum, risk management) airs during low-viewership hours. High-energy content (live trading, signal reviews) airs during peak hours.

### The curriculum-ladder scene presets

Smile Live Kit implements the curriculum ladder as five scene presets (see `docs/handoff/06-SCENE_MODEL.md` §"Curriculum-ladder presets"). Each preset has the W21 lockup, the module badge (top-right), the lesson title (center), the curriculum-ladder progress bar (bottom, above the ticker), and the ticker. The console's `SceneSwitcherPanel` shows the five presets as cards; the `SchedulePanel`'s auto-pilot switches between them on the 24-hour grid.

---

## 2. The 24-Hour Programming Grid

### The grid (EAT / UTC+3)

| Time (EAT) | Block | Module | Content | Energy |
|------------|-------|--------|---------|--------|
| 00:00–02:00 | Late Session Replay | Module 5 | V75 live trading — recorded session from the previous day's prime-time block. | HIGH |
| 02:00–06:00 | Beginner Curriculum | Module 1 | Step Index + V10 lessons. Chart reading, candlestick anatomy, support + resistance. | LOW |
| 06:00–08:00 | Asian Session | Module 3 | V25 live trading + analysis. The Asian forex session overlap — moderate volatility, good for intermediate practice. | MEDIUM |
| 08:00–12:00 | Intermediate Curriculum | Modules 2–3 | V25 → V50 lessons + Boom & Crash pattern recognition. Risk management, position sizing. | LOW |
| 12:00–14:00 | London Session | Modules 2–3 | V10 / V25 live trading. The London forex session open — high liquidity, tight spreads. | HIGH |
| 14:00–18:00 | Risk + Psychology | Module 3 (applied) | Risk management deep-dives. Trading psychology. Drawdown recovery. The "soft skills" of trading. | LOW |
| 18:00–20:00 | Prime Time — Signals | All modules | Community signal review. The day's best setups, analyzed live. Viewer-submitted charts. The highest-energy block of the day. | HIGH |
| 20:00–00:00 | Advanced Curriculum | Modules 4–5 | V75 → V100 lessons + scaling strategies. The deepest technical content. | MEDIUM |

### Grid design principles

1. **Energy matches viewership.** The high-energy blocks (Late Session Replay, London Session, Prime Time Signals) air during peak viewership hours (00:00 EAT for European evening viewers, 12:00 EAT for European afternoon, 18:00 EAT for East African evening). The low-energy blocks (Beginner Curriculum, Intermediate Curriculum, Risk + Psychology) air during off-peak hours — they're educational, not headline-driven, so they work as background content for the dedicated learner.
2. **The curriculum repeats daily.** A viewer who tunes in at 08:00 EAT every weekday sees the Intermediate Curriculum block every time. This consistency builds the "drop in any time" habit.
3. **Prime Time is the daily anchor.** The 18:00–20:00 Prime Time Signals block is the day's flagship — live (or live-as-possible), community-driven, the highest-energy. It's the block most likely to be clipped for short-form distribution.
4. **Late Session Replay bridges midnight.** The 00:00–02:00 block replays the previous day's Prime Time, so a viewer who missed it can catch up. This also fills the "after midnight" dead zone with high-energy content rather than a static "Off Air" card.
5. **Advanced Curriculum is the deep dive.** The 20:00–00:00 four-hour block is the longest single block — it gives the advanced viewer a substantial, sustained lesson. The MEDIUM energy level keeps it watchable without being exhausting.

### Content refresh cadence

- **Weekly:** Insert a new recording into the playlist rotation. The grid's structure stays the same; one new lesson enters, one old lesson exits.
- **Bi-weekly:** Refresh one complete curriculum block. Replace all four hours of, say, the Intermediate Curriculum with new recordings.
- **Monthly:** Full playlist review. Optimize for retention (YouTube Analytics audience-retention curve). Drop the lowest-retention segments; expand the highest.
- **Quarterly:** Record entirely new modules. The curriculum ladder itself is stable, but the lessons within each module rotate quarterly to keep the content fresh for repeat viewers.

### How Smile Live Kit implements the grid

The console's `SchedulePanel` (see `docs/handoff/08-CONTROL_CONSOLE.md` §"SchedulePanel") renders the 8 blocks. Each block has:
- Start time (mono, EAT).
- Block name.
- Module badge (color-coded by the curriculum ladder).
- Energy badge (low / medium / high — color-coded).
- "NOW" indicator on the current block.
- "NEXT" indicator on the upcoming block.
- "Auto-pilot: ON/OFF" toggle.

When auto-pilot is ON, the console's scheduler emits a Socket.io `state:activeScene` event at each block boundary (00:00, 02:00, 06:00, 08:00, 12:00, 14:00, 18:00, 20:00 EAT) with the new active scene. Every connected scene route updates within ~50ms. The operator can override (click a different scene card → auto-pilot pauses for the remainder of the current block).

---

## 3. The Short-Form Content Funnel

### The funnel

```
Long trading session (60–120 min)
        ↓
"Short Moments" — intentional 30–60 sec highlights, recorded during the session
        ↓
AI-assisted clip extraction (SamurAIGPT) + manual editing (CapCut browser)
        ↓
Distribution: TikTok + Instagram Reels + YouTube Shorts
        ↓
Each short links back to the 24/7 stream
        ↓
Viewer discovers the 24/7 stream → becomes a regular viewer → joins the community
```

### The "Short Moments" strategy

AI clip-extraction tools (SamurAIGPT, Fliki, Braiv) detect emotional / entertainment highlights — a laugh, a raised voice, a surprising chart move. They do NOT detect trading-chart highlights — a clean breakout, a textbook support bounce, a precise call. The W21 │ TRADING content is educational, not entertainment, so AI-detected highlights would miss the pedagogically valuable moments.

The mitigation is the "Short Moments" strategy: the on-air talent intentionally records 30–60 second summaries during the session — "Here's the V75 setup I just called, here's why I entered, here's the result." These are pre-identified as short-form assets, recorded with the short-form format in mind (vertical framing, clean audio, clear punchline). The long session is the source; the Short Moments are the extracted value.

### Short-form distribution

| Platform | Format | Posting cadence | Goal |
|----------|--------|------------------|------|
| TikTok | Vertical 9:16, 30–60 sec | 3–5 per week | Discovery — the algorithm favors new accounts with consistent posting. |
| Instagram Reels | Vertical 9:16, 30–60 sec | 3–5 per week (mirrors TikTok) | Cross-platform reach — Reels algorithm is generous to new accounts. |
| YouTube Shorts | Vertical 9:16, 30–60 sec | 3–5 per week (mirrors TikTok) | Direct funnel to the 24/7 stream — Shorts viewers are one click from the main channel. |

### The community platform

The community platform is a Phase 2+ decision (see `LAUNCH_ROADMAP.md`). The candidates:
- **Telegram** — high adoption in East Africa; supports large groups; lightweight.
- **WhatsApp** — highest adoption in East Africa; supports groups up to 1,024 members; more intimate.
- **Discord** — better structure for scaling (channels, roles, voice); lower adoption in East Africa but standard for global trading communities.

The likely path: **Telegram for the main community (adoption), Discord for the inner circle (structure).** Decision deferred to Phase 2.

### The flywheel

The 24/7 stream produces long-form content → long-form content seeds Short Moments → Short Moments drive TikTok / Reels / Shorts distribution → distribution drives discovery → discovery drives viewers to the 24/7 stream → viewers join the community → community engagement produces more long-form content (viewer-submitted charts, community signal reviews). The flywheel compounds.

---

## 4. Content Production Workflow

### The recording pipeline

```
Step 1: Pre-production (Sunday)
  - Producer reviews the previous week's analytics.
  - Producer selects 2–3 lesson topics per module.
  - Talent prepares lesson outlines (1-page each).

Step 2: Recording (Monday + Wednesday)
  - Talent records on the Xeon / 1050Ti desktop (OBS Studio, NVENC encoder).
  - Deriv MT5 Web Terminal on screen.
  - DroidCam USB phones as webcams (multi-camera setup).
  - SpeakerSplit.ai for multi-person audio (if multi-person session).
  - "Short Moments" recorded intentionally during the session (pre-identified clips).

Step 3: Editing (Tuesday + Thursday)
  - CapCut browser editor (free, 120-min, AI silence removal, auto-captions, no watermark).
  - Fallback: Shotcut (desktop, free, open-source, runs on 4GB RAM — offline backup).
  - Edit the long-form lesson + extract the Short Moments.

Step 4: Upload (Tuesday + Thursday)
  - Long-form: upload to Cloudflare R2 (10GB free tier, zero egress).
  - Short-form: upload directly to TikTok / Reels / Shorts.

Step 5: Schedule + air (continuous)
  - VPS FFmpeg loops the long-form content per the 24-hour grid.
  - Smile Live Kit's SchedulePanel auto-pilot switches scenes on the grid.
  - The 24/7 stream is continuous.
```

### Production tooling (zero-budget stack — see `TECHNICAL_INFRASTRUCTURE.md` §"Production Toolkit")

| Tool | Purpose | Cost |
|------|---------|------|
| OBS Studio | Screen + camera + mic recording. NVENC hardware encoder on the 1050Ti. | Free (open-source). |
| Deriv MT5 Web Terminal | The trading platform on screen. Browser-based, no install. | Free. |
| DroidCam USB | Phones as webcams (multi-camera). | Free. |
| SpeakerSplit.ai | AI voice separation from a single room mic. | Free. |
| CapCut (browser) | Video editing — 120-min, AI silence removal, auto-captions, no watermark. | Free. |
| Shotcut | Offline editing fallback. | Free (open-source). |
| Canva + Fliki + Braiv | Thumbnail generation. | Free tiers. |
| SamurAIGPT | Open-source AI clip extraction. | Free (open-source). |
| ImageMagick + n8n | Programmatic thumbnail generation from W21 templates. | Free (open-source). |
| Puter.js | Free AI APIs (Claude / GPT) for captions, summaries, descriptions. No API keys, no billing. | Free. |
| Cloudflare R2 | Large video file storage (10GB free tier, zero egress). | Free. |
| Puter.com | Small file storage (thumbnails, metadata, scripts). KV store for the content calendar. | Free. |

### Talent rotation + burnout prevention

The W21 │ TRADING channel is a multi-person production. The talent rotation strategy:
- **Primary talent** — the lead on-air educator. Records 2–3 sessions per week.
- **Secondary talent** — a co-host or substitute. Records 1 session per week + covers the Prime Time Signals block.
- **Guest talent** — community members, Deriv representatives, or guest educators. 1–2 sessions per quarter.

The rotation prevents burnout (the primary talent is not on-call 24/7) and adds variety (different voices keep the content fresh). The pre-recorded 24/7 model means the talent records on their schedule, not on the stream's schedule.

---

## 5. Content Language Strategy

### The decision
**English-first, with Kiswahili segments as a future differentiator.**

### The reasoning
- **English** gives global reach. The 24/7 stream is accessible to any English speaker worldwide.
- **Kiswahili** is the lingua franca of East Africa. A Kiswahili segment (or a dedicated bilingual playlist) would be a unique differentiator in the East African market.
- **Phase 1:** English-only. Focus on the curriculum + the brand + the 24/7 model.
- **Phase 2+:** Introduce Kiswahili segments — perhaps a weekly "Kiswahili Friday" block, or a parallel Kiswahili-dubbed version of the curriculum.

Smile Live Kit supports this via `next-intl` (already in the dependency stack). The scene routes can render in either language based on a `?lang=sw` query param or a `lang` cookie.

---

## 6. Pre-Recorded Authenticity (Transparency Strategy)

### The risk
Pre-recorded 24/7 content risks the "fake live" perception — viewers feel deceived if they discover the stream is not actually live.

### The mitigation
1. **Clear labeling.** Every pre-recorded block is labeled in the scene as "Recorded Session" or "Lesson Replay." The label is in the top-right, next to the LIVE badge, in the same mono typography.
2. **Periodic real-time live sessions.** The Prime Time Signals block (18:00–20:00 EAT) is the daily live anchor — when possible, it airs live. The London Session (12:00–14:00 EAT) is also a candidate for live airing on high-volatility days.
3. **Transparency is the brand promise.** The channel's About page + the scene bug both state: "W21 │ TRADING is a 24/7 educational channel. Live blocks are marked LIVE. Replay blocks are marked Recorded Session. We do not simulate liveness."
4. **YouTube July 2025 policy alignment.** YouTube's policy explicitly protects "value-adding commentary and educational content" while penalizing spammy loops. W21's transparent model is the protected category, not the penalized one.

### The Smile Live Kit implementation
- The scene's `LiveBadge` component (see `docs/handoff/06-SCENE_MODEL.md` §"Tally + Live Indicator") shows `● LIVE` when the scene is in live mode, or `▶ RECORDED` when in replay mode.
- The console's `SceneSwitcherPanel` cards show the same indicator — the operator can mark a block as "live" or "replay" when scheduling.
- The `SchedulePanel` auto-pilot tracks which blocks are live vs. replay and emits the appropriate state.

---

## 7. Content Quality Standards

### Production quality (per scene)
- **Resolution:** 1920×1080 (OBS Browser Source native).
- **Frame rate:** 60fps for live blocks (OBS captures at 60); 30fps acceptable for recorded blocks (FFmpeg loops at 30 to save VPS CPU).
- **Audio:** Clean mix — host mic at -12dB peak, music bed at -24dB, no clipping. SpeakerSplit.ai for multi-person separation.
- **Branding:** W21 lockup in the top-left at 96px. Live/Recorded badge in the top-right. Ticker at the bottom. Structural grid on the root.

### Educational quality (per lesson)
- **Outline-first.** Every lesson has a 1-page outline (objective, key concepts, examples, summary).
- **Example-driven.** Concepts are taught with real chart examples, not abstract diagrams.
- **Risk-aware.** Every lesson includes a risk-management note ("This setup has a 40% win rate; size your position accordingly").
- **Action-oriented.** Every lesson ends with a concrete action the viewer can take on a demo account.

### Short-form quality (per Short Moment)
- **Vertical 9:16.** Native to TikTok / Reels / Shorts.
- **30–60 seconds.** Tight, no filler.
- **Clear hook in the first 3 seconds.** "Here's a V75 setup that just hit my target."
- **W21 branding** in the corner (small, persistent).
- **Call-to-action** at the end: "Full lesson on the 24/7 stream — link in bio."

---

## 8. Content Calendar + Prisma Storage

Smile Live Kit stores the content calendar in Prisma (see `docs/handoff/03-PROJECT_STRUCTURE.md`):

```prisma
model Schedule {
  id        String   @id @default(cuid())
  date      DateTime
  blockName String   // "Late Session Replay", "Beginner Curriculum", etc.
  moduleId  Int      // 1-5
  lessonId  String?  // FK to Lesson
  isLive    Boolean  @default(false)
  notes     String?
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  moduleId    Int      // 1-5
  outline     String   // markdown
  videoUrl    String?  // R2 URL
  durationMin Int?
  createdAt   DateTime @default(now())
  schedule    Schedule[]
}
```

The console's `SchedulePanel` reads + writes this via `GET /api/schedule` + `POST /api/schedule`. The auto-pilot uses it to determine the active scene at each block boundary.

---

*Next: [`TECHNICAL_INFRASTRUCTURE.md`](TECHNICAL_INFRASTRUCTURE.md) for the VPS streaming model + hybrid deployment + storage architecture.*
