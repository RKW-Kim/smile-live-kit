# AGENTS.md — AI Handoff Protocol

> **This file is the contract between every AI/chat that works on Smile Live Kit.** Read it before writing any code or doc. Follow it exactly. It guarantees seamless handoff between AIs — no AI is ever "new," every session continues the one before it.

---

## The 3 Sacred Rules

### Rule 1: The Worklog is Non-Rollbackable

Every work session — whether 5 minutes or 5 hours — **MUST** append to [`worklog.md`](worklog.md) at the repo root. Format:

```markdown
---
Task ID: <unique-id>   (e.g., DOCS-1, SCENE-LIVE-2, TICKER-DERIV-3, FIX-CONSOLE-1)
Agent: <your identifier>   (e.g., "zai-code (opus, main orchestrator)", "gpt-5", "human:RKW")
Task: <one-line description of what you were asked to do>

Work Log:
- <concrete step 1>
- <concrete step 2>
- <concrete step 3>

Stage Summary:
- <key results / decisions / artifacts produced>
- <files touched>
- <what the next AI should know>
```

**Before starting work:** Read the last 3-5 entries at the bottom of `worklog.md` to understand what the previous AI did. Also read `docs/handoff/CURRENT_STATE.md` for the live state snapshot.

**After finishing work:** Append your entry. Commit + push with `git add worklog.md && git commit -m "docs: worklog [Task ID: <id>]"`.

The worklog is the project's memory. Without it, every session starts from zero.

### Rule 2: The W21 Mark is Sacred

`src/components/w21/W21Mark.tsx` is the crown jewel of the entire W21 ecosystem. It is the universal mark — a rounded square containing "W21" + a status dot, rendered identically across **every** channel and every vertical.

- Do NOT modify `W21Mark.tsx`. The proportions (square radius ≈ 11% of width, border weight ≈ 4.5%, "W21" glyph height ≈ 62%, dot diameter ≈ 6% sitting left of "W" with vertical centering, soft radial glow at ~16% radius) are locked.
- Do NOT "improve" or "refactor" it. Do not introduce animation libraries into it. Do not change the typeface (JetBrains Mono Bold). Do not nudge the dot position. Do not change the border color or opacity (Grid White #F5F5F5 at ~65%).
- Do NOT change the fill (Terminal Black #0A0A0A) or the layout strategy (CSS-only, no SVG, no canvas).
- The **ONLY** variable across channels is **color** — the status dot fill + the glow shadow. That color is sourced from `src/lib/w21/channels.ts` and is the channel's signature color.
- If you need to add a W21-adjacent element (a watermark variant, a favicon, a lockup with the channel name), build it as a **separate** component (`W21Lockup.tsx`, `W21Watermark.tsx`, etc.) that *composes* `W21Mark` — never modify the mark itself.
- Bugs in `W21Mark.tsx` are documented in [`docs/handoff/12-KNOWN_ISSUES.md`](docs/handoff/12-KNOWN_ISSUES.md) but are NOT patched locally unless the operator (the human) explicitly approves it. The mark is a design contract, not a code artifact.

The complete spec lives in [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md). Read it before touching anything in `src/components/w21/`.

### Rule 3: OBS is the Gold Standard

Smile Live Kit is an **OBS-focused** kit. The application does not replace OBS — it **extends** OBS by rendering scenes, overlays, tickers, and a control console as Next.js routes that OBS consumes via Browser Sources.

Every feature decision is cross-referenced against **OBS Studio** and its proven community plugin ecosystem:

- If OBS has a feature (Browser Source, Scene Collections, Source Transforms, Audio Mixer, Filters, Replay Buffer, Studio Mode, Transitions, Sources locking/hiding, Hotkeys, Statistics, Profile/SLO management, Multiview, Dockable Panels, Stream/Recording settings), we should have an equivalent or have it on the roadmap.
- If a proven community plugin (e.g., OBS WebSocket, StreamFX, Advanced Scene Switcher, Source Record, Move Transition, Input Overlay, Scene Note) has a feature that aligns with our scope, we should consider it.
- If neither OBS nor proven community plugins have it, **we probably don't need it.** Build features that OBS users recognize — not invented workflows.

The OBS parity matrix is in [`docs/handoff/09-FEATURES.md`](docs/handoff/09-FEATURES.md). When in doubt about a feature's behavior, check how OBS does it first.

> **The OBS integration model:** Every Smile Live Kit scene/overlay route is rendered as a **full-screen 1920×1080 page** (transparent where appropriate), loaded into OBS as a **Browser Source**. The control console at `/` is the operator's interface — it pushes state (scene selection, ticker text, market data, tally, color) to the scene routes via Socket.io or a shared API. See [`docs/handoff/07-OBS_INTEGRATION.md`](docs/handoff/07-OBS_INTEGRATION.md) for the full integration model.

---

## Workflow — How To Work On This Project

### Step 1: Orient (before writing code or docs)

1. Read this file (`AGENTS.md`) in full.
2. Read [`docs/handoff/CURRENT_STATE.md`](docs/handoff/CURRENT_STATE.md) — what's done, what's next.
3. Read the last 3-5 entries at the bottom of [`worklog.md`](worklog.md).
4. Skim the relevant feature doc in [`docs/handoff/`](docs/handoff/) for your task:
   - Touching scenes/overlays → [`06-SCENE_MODEL.md`](docs/handoff/06-SCENE_MODEL.md)
   - Touching OBS wiring → [`07-OBS_INTEGRATION.md`](docs/handoff/07-OBS_INTEGRATION.md)
   - Touching the control panel → [`08-CONTROL_CONSOLE.md`](docs/handoff/08-CONTROL_CONSOLE.md)
   - Touching market data / ticker → [`10-DATA_FEEDS.md`](docs/handoff/10-DATA_FEEDS.md)
   - Touching realtime transport → [`11-TRANSPORT_REALTIME.md`](docs/handoff/11-TRANSPORT_REALTIME.md)
5. Check [`docs/handoff/12-KNOWN_ISSUES.md`](docs/handoff/12-KNOWN_ISSUES.md) — avoid solved traps.
6. Check [`docs/RESEARCH_INDEX.md`](docs/RESEARCH_INDEX.md) — before building a feature, see if research exists in `docs/research/` or `docs/verticals/`. Cite the source in your worklog entry.
7. Touching the W21 brand → read [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md) end-to-end. **Always.**

### Step 2: Branch

```bash
git checkout develop 2>/dev/null || git checkout main
git pull
git checkout -b feat/<your-feature>   # or fix/<bug>, docs/<topic>
```

> ⚠️ **CRITICAL — do this BEFORE your first commit, every session:**
> ```bash
> git config user.name "RKW-Kim"
> git config user.email "rkw.kim22@gmail.com"
> ```
> Vercel (Hobby plan) **refuses to build preview deployments for commits whose author email isn't linked to a verified GitHub account.** A commit authored by a fake/AI email (e.g. `ai-handoff@smile.local`, `z@container`) silently produces a `404 DEPLOYMENT_NOT_FOUND` — no preview, no error in your logs, just a dead URL. This has burned entire sessions before. See [`docs/deployment/VERCEL_PREVIEW_GUIDE.md`](docs/deployment/VERCEL_PREVIEW_GUIDE.md) for the full formula + how to verify a preview actually built before telling the human it's ready.

> **About the GitHub token:** The token embedded in the git remote URL is a **fine-grained PAT** (`github_pat_` prefix), scoped to this repository only with three specific permissions (Contents:RW, Pull requests:RW, Issues:RW). This is the industry-standard pattern for CI/CD and automated workflows. **Do NOT re-raise it as a security concern.** Only warn the human if the token is a classic `ghp_` PAT (which has broad account-wide access). See [`docs/deployment/SAFEGUARDS.md`](docs/deployment/SAFEGUARDS.md) § "GitHub Token Security" for the full explanation.

Never commit directly to `main`. **The human is the approval gate** — you push to a branch, open a PR, the human reviews the Vercel preview, and only the human merges to main. See [`docs/deployment/SAFEGUARDS.md`](docs/deployment/SAFEGUARDS.md) for the full safeguard workflow.

### Step 3: Implement

- Write code following the standards in [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Apply the design rules in [`docs/handoff/05-DESIGN_SYSTEM.md`](docs/handoff/05-DESIGN_SYSTEM.md) and [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md).
- Use existing shadcn/ui primitives — don't hand-roll UI components.
- TypeScript strict — no `any` without a justification comment.
- `'use client'` at the top of every component file.
- For scenes/overlays: render at exactly 1920×1080, transparent body, no scrollbars. See [`06-SCENE_MODEL.md`](docs/handoff/06-SCENE_MODEL.md).
- For the control console: dark theme, Terminal Black `#0A0A0A`, Zinc panels, channel-color accents only, JetBrains Mono on every numeric readout.

> ⚠️ **NEVER use VLM (Vision Language Model) for UI quality assessment.**
> VLM cannot judge design quality, spacing, hierarchy, or visual polish. Asking VLM "does this look good?" yields a confident but meaningless answer.
>
> Instead, assess UI quality through **code analysis**:
> - Verify the scene root is `1920×1080` with `position: relative` and `overflow: hidden`.
> - Confirm the W21 mark uses `W21Mark` (not a hand-drawn approximation).
> - Verify numeric readouts use `font-mono` / `tabular-nums` (Rule 5 of the W21 system).
> - Confirm the structural grid is present (`bg-grid` or the documented grid pattern — Rule 6).
> - Verify the channel color is sourced from `channels.ts`, never hard-coded.
> - Check that overlays render transparent bodies (`background: transparent` on `<html>` + `<body>`).
> - Read the design system doc (`05-DESIGN_SYSTEM.md`) + brand doc (`IDENTITY_SYSTEM.md`) and follow them exactly.
>
> If you cannot determine visual quality from the code, ask the human to review the preview. Never claim "VLM confirmed it looks premium" — that is meaningless.

### Step 4: Verify

```bash
bun run lint              # ESLint must pass (0 errors)
bunx tsc --noEmit         # TypeScript must pass (0 errors)
bun run dev               # Dev server must return 200 on / AND on /scenes/<route>
```

For scene-route smoke tests:
```bash
curl -sf -o /dev/null http://localhost:3000/scenes/trading-live && echo "scene OK"
```

For full local verification (lint + tsc + dev 200):
```bash
bash scripts/verify.sh          # full suite
bash scripts/verify.sh --quick  # lint + tsc only
```

### Step 5: Document + Worklog

- Append your work to [`worklog.md`](worklog.md) using the format above.
- If you added a feature, update [`docs/handoff/09-FEATURES.md`](docs/handoff/09-FEATURES.md).
- If you hit a new gotcha, add it to [`docs/handoff/12-KNOWN_ISSUES.md`](docs/handoff/12-KNOWN_ISSUES.md).
- Update [`docs/handoff/CURRENT_STATE.md`](docs/handoff/CURRENT_STATE.md) if the project state changed.
- If you added a new scene/overlay route, update [`docs/handoff/06-SCENE_MODEL.md`](docs/handoff/06-SCENE_MODEL.md).
- If you added a new channel or color, update [`docs/brand/IDENTITY_SYSTEM.md`](docs/brand/IDENTITY_SYSTEM.md) and `src/lib/w21/channels.ts` (and only there).

### Step 6: Commit + Push

```bash
git add -A
git commit -m "<type>(<scope>): <description> [Task ID: <id>]"
git push -u origin feat/<your-feature>
```

Commit format: `<type>(<scope>): <description> [Task ID: <id>]`

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`
Scopes: `brand`, `scene`, `overlay`, `console`, `control`, `ticker`, `docs`, `infra`

Examples:
```
feat(scene): add /scenes/trading-live full 1920×1080 layout [Task ID: SCENE-LIVE-1]
fix(ticker): Deriv websocket reconnect on token refresh [Task ID: FIX-TICKER-3]
docs(handoff): update CURRENT_STATE for v2 foundation [Task ID: DOCS-1]
refactor(console): extract scene switcher into SceneSwitcherPanel [Task ID: REFACT-2]
```

### Step 7: Pull Request + Preview + Review Routing

Open a PR on GitHub. Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`). CI runs (lint + typecheck + build + dev-server smoke). Vercel builds a preview deployment — read the real URL from the `vercel[bot]` PR comment (do NOT guess it — see [`docs/deployment/VERCEL_PREVIEW_GUIDE.md`](docs/deployment/VERCEL_PREVIEW_GUIDE.md)).

**Label the PR with exactly ONE review type** (see [`docs/development/PR_REVIEW_PROCESS.md`](docs/development/PR_REVIEW_PROCESS.md) for the full system):

- 🟠 **`needs-human-review`** — there ARE visible changes (a new scene, a recolored overlay, a console layout change, a ticker redesign). Fill in the "👀 What to check" section with specific things for the human to verify in the Vercel preview — e.g., "Open `/scenes/trading-live`, confirm the W21 mark renders at 96px in the top-left, the ticker scrolls at 60fps, the channel cyan #00F0FF is the only chromatic color in the composition, the body is transparent." Give the human the preview URL + the checklist. **Do NOT merge.** Wait for "merge it" (→ merge, squash) or "fix X" (→ fix on same branch, new preview).
- 🟢 **`ai-verified`** — NO visible changes (backend/types/lint/docs/config/refactor). Verify lint + tsc + dev + scene-route 200s all pass, **self-merge** (squash), then tell the human "merged PR #X (ai-verified) — nothing for you to check." The human is informed, not blocked.

**The rule:** you NEVER merge a `needs-human-review` PR without the human's explicit "merge it." You MAY self-merge an `ai-verified` PR after verification. When unsure, choose `needs-human-review` (safer). See [`docs/deployment/SAFEGUARDS.md`](docs/deployment/SAFEGUARDS.md) for the full safeguard system.

### Step 8: After Merge

- Pull the updated main: `git checkout main && git pull`.
- Delete the local feature branch: `git branch -d feat/<your-feature>`.
- The worklog entry (Step 5) is already on main — nothing more to do.
- If the merge touched a scene/overlay route, sanity-check the production URL (`https://smile-live-kit.vercel.app/scenes/<route>`) returns 200 and renders (use `agent-browser` or ask the human to verify).

---

## The "I Am Not A New Chat" Principle

This project is engineered so that **no AI is ever new.** When you start:

- You inherit the full worklog — every previous AI's work is there.
- You inherit the full docs — every decision is documented in `docs/handoff/` (17 numbered files), `docs/brand/`, `docs/verticals/`, `docs/deployment/`, `docs/development/`, `docs/adr/`.
- You inherit the codebase — every file is version-controlled on GitHub, immune to sandbox resets.
- You inherit the v1 legacy kit on `legacy/v1-python-static` branch — the Python + static-HTML scenes + OBS scene collection that this v2 Next.js kit supersedes. Do NOT touch the legacy branch unless the human explicitly asks. Do NOT throw away v1 concepts — port them to Next.js where they still add value.

You are not starting fresh. You are continuing. Act accordingly:

- **Don't re-architect** what's already architected (Next.js routes as scenes, control console at `/`, W21 mark as the universal identity, channel color map in `channels.ts`).
- **Don't re-decide** what's already decided (the 6 brand rules, the channel color map, the OBS Browser Source integration model, the VPS+FFmpeg streaming target for the 24/7 W21 Trading channel).
- **Don't re-fix** what's already fixed (check `12-KNOWN_ISSUES.md` first).
- **Don't re-research** what's already researched (check `docs/RESEARCH_INDEX.md` and `docs/verticals/w21-trading/` first — six research sessions already validated the trading vertical's market, content, technical, and brand strategy).
- **Do append** to the worklog. **Do push** to GitHub. **Do leave the project better than you found it.**

---

## CI & Verification Infrastructure

### The Problem

AI agents often run in sandboxed environments without bun, network, or persistent processes. They cannot always verify their own work locally.

### The Solution: CI as the Agent's Eyes

Every push triggers the CI workflow (`.github/workflows/ci.yml`):

1. **lint** — ESLint must pass. Blocking.
2. **typecheck** — `bunx tsc --noEmit` must report 0 errors. Blocking.
3. **build** — `next build` must succeed. Blocking.
4. **dev-server** — `next dev` starts, polls `GET /` until 200, kills the server. Blocking.

**For AI agents:** Push your branch, wait for CI, read the Checks tab on GitHub. Green = verified. Red = fix and push again.

### Local Verification

```bash
bash scripts/verify.sh          # full suite: bun install + prisma generate + db:push + lint + tsc + dev 200
bash scripts/verify.sh --quick  # lint + tsc only
bash scripts/agent-bootstrap.sh # bootstrap a bare sandbox: git identity + install + db + dev
```

### Verification Hierarchy

| Level | What | Where |
|-------|------|-------|
| 1 | Lint + tsc | CI (ci.yml) + `verify.sh --quick` |
| 2 | Build + Dev 200 | CI (ci.yml) + `verify.sh` |
| 3 | Scene-route smoke (`GET /scenes/* 200`) | `verify.sh` (planned) + manual `curl` |
| 4 | Vercel preview | Human reviews |
| 5 | `agent-browser` snapshot | Optional bonus — confirms the scene renders, the mark is present, the body is transparent |

Levels 1-2 are automated and blocking. Level 4 is the human gate. Level 5 is for AI agents who want to programmatically confirm a scene route renders before opening a PR.

---

## Gateway & Cross-Service Rules

### Relative paths only — hard rule

All `fetch` calls, asset URLs, and API requests from the browser use **relative paths only**. Never `fetch('http://localhost:3000/...')`, never `fetch('https://smile-live-kit.vercel.app/api/...')` from the client.

```ts
// ✅ Good
await fetch('/api/scene/current')
await fetch('/api/ticker/deriv/tick')

// ❌ Bad
await fetch('http://localhost:3000/api/scene/current')
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scene/current`)
```

This guarantees the same code works in dev (localhost:3000), preview (Vercel), and production (custom domain) without environment-specific branching.

### Cross-service: `?XTransformPort=N` query param

If (and only if) Smile Live Kit spawns independent mini-services (independent bun projects with their own ports — see `docs/handoff/02-ARCHITECTURE.md` §"Mini-Services"), the gateway pattern is the **`?XTransformPort=N`** query param:

```ts
// Calling a mini-service on port 3001 (e.g., a market-data relay):
await fetch('/api/proxy?XTransformPort=3001&path=/deriv/tick')

// WebSocket to a mini-service:
import { io } from 'socket.io-client'
const socket = io('/?XTransformPort=3001', { path: '/' })
```

The Caddyfile (or Vercel rewrite rules in `vercel.json`) rewrites the request to `http://localhost:3001/deriv/tick`. The browser never knows the upstream port — the URL stays relative.

> Do NOT introduce mini-services unless the architecture calls for them. As of v2 foundation, Smile Live Kit is a single Next.js app. Mini-services are added only when a subsystem (e.g., a Deriv market-data relay, an OBS WebSocket bridge) genuinely needs to run on a separate process/port. Document the decision in an ADR under `docs/adr/`.

---

## What Each AI Should Know (TL;DR)

- **Project:** Smile Live Kit — an OBS-focused live-streaming scene/overlay/control kit for the World 21 (W21) ecosystem.
- **Parent brand:** smile.co.ke. Universal mark: rounded square with "W21" + a colored status dot.
- **Channels:** Trading #00F0FF, News #FF8C00, Politics #DC2626, Agriculture #22C55E, Innovation #6366F1, Impact #F0EDE5, Health #14B8A6, Education #3B82F6, Culture #F97316, Sports #84CC16, Tech #8B5CF6. Parent color: Gold #F5A623.
- **System colors:** Terminal Black #0A0A0A, Grid White #F5F5F5, Zinc #27272A, Alert Magenta #FF006E.
- **Stack:** Next.js 16 (App Router) + TypeScript 5 + Tailwind 4 + shadcn/ui + Prisma (SQLite) + Socket.io + Zustand.
- **Architecture:** Next.js routes at `/scenes/*` and `/overlays/*` render full-screen 1920×1080 pages consumed by OBS Browser Sources. The control console at `/` is the grandma-operable operator panel. State flows from console → scenes via Socket.io (or shared API for one-shot state). Live market data flows via WebSocket (Deriv/Twelve Data) through a budget-gated data layer.
- **Brand rules (non-negotiable):** (1) The mark is sacred — never changes. (2) Color is the differentiator. (3) Channel name stays white (Grid White). (4) Gold is the parent color. (5) Numbers are always monospaced (JetBrains Mono). (6) The grid never sleeps (faint structural grid in every composition).
- **State:** See [`docs/handoff/CURRENT_STATE.md`](docs/handoff/CURRENT_STATE.md) for what is built and what is next. As of the v2 foundation: git remote + legacy branch + W21 identity system + first scene route + this documentation are the starting point.

---

*This file is the anchor. Every AI reads it. Every AI follows it. The project continues across sessions, sandboxes, and model swaps without losing context.*
