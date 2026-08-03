# 00 — MASTER HANDOFF INDEX

## Smile Live Kit — W21 Broadcast Suite

**Last known state:** v2 foundation being built. The repository is on `main` with git remote configured (fine-grained PAT), the v1 Python+static-HTML kit is preserved on the `legacy/v1-python-static` branch, the W21 identity system is implemented as code in `src/components/w21/` + `src/lib/w21/channels.ts`, and the documentation system you are reading is in place. The first scene route (`/scenes/trading-live`), the control console at `/`, and the market-data + ticker wiring are being built in parallel (see [`CURRENT_STATE.md`](CURRENT_STATE.md) for the live status).

**Purpose:** Enable any AI/chat (or human developer) to continue the project **as if nothing happened.** Every document below is self-contained but cross-references the others. Read this index first, then dive into the relevant doc.

---

## 📂 Documentation Map

Read in this order if you're new to the project:

| # | Document | What it covers |
|---|----------|----------------|
| 00 | **MASTER-HANDOFF-INDEX.md** (this file) | Entry point, how to use this docs, the 3 sacred rules summary |
| 01 | **PROJECT_VISION.md** | What Smile Live Kit IS — the OBS Browser Source model, who it's for, what it is NOT |
| 02 | **ARCHITECTURE.md** | Next.js routes as scenes/overlays, control console at `/`, data layer, transport |
| 03 | **PROJECT_STRUCTURE.md** | Full file tree, every directory, every file, what it does |
| 04 | **TECH_STACK.md** | Exact dependencies + why each was chosen + install commands |
| 05 | **DESIGN_SYSTEM.md** | Dark theme, color tokens, typography, scene/overlay conventions, console conventions |
| 06 | **SCENE_MODEL.md** | How scenes are structured — 1920×1080 frame, transparent body, scene presets, the W21 lockup placement |
| 07 | **OBS_INTEGRATION.md** | Browser Sources, scene collections, plugins, OBS WebSocket, the deployment pattern |
| 08 | **CONTROL_CONSOLE.md** | The grandma-operable panel — scene switcher, ticker editor, channel selector, tally |
| 09 | **FEATURES.md** | Feature list + OBS parity matrix + roadmap |
| 10 | **DATA_FEEDS.md** | Market data — Deriv, Twelve Data, budget-gating, ticker, simulated fallback |
| 11 | **TRANSPORT_REALTIME.md** | Socket.io for console→scene control, WebSocket for live market data |
| 12 | **KNOWN_ISSUES.md** | Bugs, gotchas, SSR pitfalls — read before writing code |
| 13 | **GITHUB_MIGRATION_GUIDE.md** | Repo setup, Vercel, CI/CD, the commit-author-email rule |
| 14 | **WORKLOG_FULL.md** | Reference to the canonical worklog at `/worklog.md` (repo root) |
| 15 | **CONTINUATION_PROMPT.md** | Copy-paste prompt for the next AI/chat |
| 16 | **WORKFLOW_FEASIBILITY.md** | Sandbox capability assessment + GitHub/Vercel workflow |
| — | **AI_BRIEFING.md** | The single-source-of-truth briefing — read ONCE, know everything |
| — | **CURRENT_STATE.md** | What's done, what's next — update at the end of every session |

---

## 🚀 Quick Start for the Next AI/Chat

If you are an AI/chat continuing this project, do this **in order**:

1. **Read** [`AI_BRIEFING.md`](AI_BRIEFING.md) — the single-source-of-truth briefing.
2. **Read** [`CURRENT_STATE.md`](CURRENT_STATE.md) — what's done, what's next.
3. **Read** [`15-CONTINUATION_PROMPT.md`](15-CONTINUATION_PROMPT.md) — copy-paste-ready briefing for handoff.
4. **Read** [`01-PROJECT_VISION.md`](01-PROJECT_VISION.md) and [`02-ARCHITECTURE.md`](02-ARCHITECTURE.md) to understand the bones.
5. **Read** [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md) — the W21 brand bible (read end-to-end before touching anything in `src/components/w21/`).
6. **Read** [`13-GITHUB_MIGRATION_GUIDE.md`](13-GITHUB_MIGRATION_GUIDE.md) — the repo + Vercel + commit-author-email rule.
7. **Skim** [`03-PROJECT_STRUCTURE.md`](03-PROJECT_STRUCTURE.md) to know where things go.
8. **Read** the relevant feature doc (06–11) for the task at hand.
9. **Check** [`12-KNOWN_ISSUES.md`](12-KNOWN_ISSUES.md) before writing code — avoid the traps that were already solved.
10. **Append** to [`/worklog.md`](../../worklog.md) as you work (the worklog pattern is sacred — see Rule 1).

---

## 🔑 The 3 Sacred Rules

These rules kept the project alive across sessions. **Never break them:**

### Rule 1: The Worklog is Non-Rollbackable
Every AI session **must** append to `/worklog.md` (repo root) before AND after work. Format:
```markdown
---
Task ID: <unique-id>
Agent: <agent name>
Task: <what you were asked to do>

Work Log:
- <step 1>
- <step 2>

Stage Summary:
- <key results / decisions / artifacts>
- <files touched>
- <what the next AI should know>
```
The worklog is how the next AI knows what the previous AI did. Without it, every session starts from zero. See [`AGENTS.md`](../../AGENTS.md) §"Rule 1" for the full protocol.

### Rule 2: The W21 Mark is Sacred
`src/components/w21/W21Mark.tsx` is the universal mark — a rounded square containing "W21" + a status dot. Proportions, border weight, typeface, dot position, fill color (Terminal Black), border color (Grid White at ~65%), and the radial glow are all locked. The **only** variable across channels is **color** (the status dot fill + glow shadow), sourced from `src/lib/w21/channels.ts`. Do NOT modify, refactor, or "improve" `W21Mark.tsx`. Do NOT change its typeface (JetBrains Mono Bold). Do NOT nudge the dot position. Bugs go in [`12-KNOWN_ISSUES.md`](12-KNOWN_ISSUES.md), not into local patches. See [`../brand/IDENTITY_SYSTEM.md`](../brand/IDENTITY_SYSTEM.md) for the complete spec.

### Rule 3: OBS is the Gold Standard
Smile Live Kit is an **OBS-focused** kit — it does NOT replace OBS, it extends it. Every scene/overlay route renders as a full-screen 1920×1080 page consumed by an OBS Browser Source. Every feature decision is cross-referenced against OBS Studio + proven community plugins (OBS WebSocket, StreamFX, Advanced Scene Switcher, Source Record, Move Transition). If OBS has it, we should have it (or it's on the roadmap). If neither OBS nor proven community plugins have it, we probably don't need it. The parity matrix is in [`09-FEATURES.md`](09-FEATURES.md). See [`AGENTS.md`](../../AGENTS.md) §"Rule 3" for the full protocol.

---

## 🏗️ Project Summary (TL;DR)

**Smile Live Kit** is an OBS-focused live-streaming scene/overlay/control kit for the **World 21 (W21)** ecosystem. Parent brand: smile.co.ke. The kit renders full-screen 1920×1080 scenes and overlays as Next.js routes (`/scenes/*`, `/overlays/*`) that OBS consumes as Browser Sources, plus a grandma-operable control console at `/` that pushes state to those routes via Socket.io.

### The W21 universal mark
A rounded square containing "W21" + a colored status dot. The mark never changes; only the dot color (and the pipe divider in the lockup) changes per channel — that is how viewers know which channel they're watching.

### Channels
- **Trading #00F0FF** (Signal Cyan) — the launch channel; 24/7 synthetic indices + forex education for Kenya/East Africa + global audience.
- **News #FF8C00**, **Politics #DC2626**, **Agriculture #22C55E**, **Innovation #6366F1**, **Impact #F0EDE5**, **Health #14B8A6**, **Education #3B82F6**, **Culture #F97316**, **Sports #84CC16**, **Tech #8B5CF6** — future verticals.
- **Parent #F5A623** (Unity Gold) — the smile.co.ke master brand color.

### The 6 brand rules (non-negotiable)
1. The mark is sacred — never changes.
2. Color is the differentiator (status dot + pipe).
3. Channel name stays white (Grid White #F5F5F5).
4. Gold #F5A623 is the parent color.
5. Numbers are always monospaced (JetBrains Mono).
6. The grid never sleeps (a faint structural grid is present in every composition).

### Tech stack
- **Next.js 16** (App Router, Turbopack) + **TypeScript 5** (strict)
- **Tailwind CSS 4** + **shadcn/ui** (New York style) + **Lucide icons**
- **Prisma ORM** (SQLite dev / PostgreSQL prod) + **Zustand** (client state) + **TanStack Query** (server state)
- **Socket.io** (console→scene transport) + native **WebSocket** (live market data)
- **Framer Motion** (animations) + **@dnd-kit** (drag-and-drop, when needed)
- **Geist Sans** + **JetBrains Mono** (fonts — mono is mandatory for all numeric readouts)
- **Bun** (package manager + runtime)

### Architecture in one paragraph
The control console at `/` is the operator's interface. Each scene (e.g., `/scenes/trading-live`) and each overlay (e.g., `/overlays/lower-third`) is a Next.js route that renders a full-screen 1920×1080 page. The console pushes state to the scenes via Socket.io (active scene, ticker text, tally, channel color). Market data flows via WebSocket from Deriv (synthetic indices) or Twelve Data (forex) through a budget-gating layer that falls back to a cached/simulated stream when the daily API budget is exhausted. The OBS operator loads each scene route as a Browser Source at 1920×1080 and switches between them via OBS Scene Collections or via OBS WebSocket (which the console can drive).

### The v1 legacy
The repo's `legacy/v1-python-static` branch preserves a previous iteration: a Python Flask bridge (`server/app.py`, port 8787) + static HTML scenes (`core/01-starting-soon.html`, `03-live.html`, etc.) + an OBS scene collection (`obs/Smile-Trading-Kit.json`) + brand packs. It is **not obsolete** — it is the v1 that v2 (this Next.js kit) supersedes. Do NOT touch the legacy branch unless explicitly asked. Do NOT throw away v1 concepts — port them to Next.js where they still add value (the Python market-data bridge → Next.js API route; the static HTML scenes → Next.js scene routes; the OBS scene collection → an export feature in the console).

---

## 📍 Where the Project Is Going (Roadmap)

In priority order (see [`09-FEATURES.md`](09-FEATURES.md) for the full matrix + [`../verticals/w21-trading/LAUNCH_ROADMAP.md`](../verticals/w21-trading/LAUNCH_ROADMAP.md) for the channel-level roadmap):

1. **v2 foundation** — git remote, legacy branch, W21 identity as code, this docs system (DONE — `FOUNDATION-1` + `DOCS-1`).
2. **First scene route** — `/scenes/trading-live` per the W21 Trading Prompt 07 spec. Built in parallel by the code subagent.
3. **Control console v1** — `/` with a scene switcher, a channel selector, a ticker editor, a tally indicator. Built in parallel by the code subagent.
4. **Market data layer** — Deriv WebSocket + Twelve Data REST + budget-gating + simulated fallback. (See [`10-DATA_FEEDS.md`](10-DATA_FEEDS.md).)
5. **Ticker overlay** — `/overlays/ticker` that consumes the live market data + the console's ticker text.
6. **Scene presets** — Starting Soon, Live, Be Right Back, Off-Air, plus the W21 Trading curriculum-ladder presets (Step Index, V10, V25, V50, V75, V100).
7. **24-hr programming grid auto-pilot** — the console schedules scene switches on the W21 Trading 24-hour grid (see [`../verticals/w21-trading/CONTENT_STRATEGY.md`](../verticals/w21-trading/CONTENT_STRATEGY.md)).
8. **OBS WebSocket bridge** — the console drives OBS directly (cut, transition, scene switch) via the `obs-websocket-js` library.
9. **Scene Collection export** — the console exports the current scene list as an OBS Scene Collection JSON (round-trip parity with OBS).
10. **W21 Trading launch** — Phase 0 pre-launch checklist (see [`../verticals/w21-trading/LAUNCH_ROADMAP.md`](../verticals/w21-trading/LAUNCH_ROADMAP.md)).

---

## ⚠️ A Note on the Sandbox

The development sandbox is **ephemeral** — it can reset, taking `/home/z/my-project/` with it. This is exactly why the project moved to GitHub + Vercel:

- The GitHub repo (`github.com/RKW-Kim/smile-live-kit`) is the source of truth. Every commit is a checkpoint.
- Vercel builds preview deployments from GitHub — immune to sandbox resets.
- The worklog + this docs system mean **zero context loss** across sessions, sandboxes, and model swaps.
- The `legacy/v1-python-static` branch is also on GitHub — the v1 kit is safe.

See [`16-WORKFLOW_FEASIBILITY.md`](16-WORKFLOW_FEASIBILITY.md) for the full sandbox capability assessment + the GitHub/Vercel workflow.

---

*This documentation is the project's memory. Treat it well.*
