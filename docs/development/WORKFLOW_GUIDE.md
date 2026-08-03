# Workflow Guide — How To Work With Me In The New Ecosystem

> This is the operating manual for you (the human) + me (the AI) + GitHub + Vercel. Read this once, refer back anytime.

---

## The Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│  YOU (here, in this chat)                                    │
│  └─ Tell me what to build / fix / research                   │
└──────────────────┬──────────────────────────────────────────┘
                   │ "Add the /overlays/ticker route"
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  ME (the AI, in this sandbox)                                │
│  ├─ Read AGENTS.md + CURRENT_STATE + last worklog entries   │
│  ├─ Read docs/brand/IDENTITY_SYSTEM.md (if touching w21/)   │
│  ├─ Create a branch: feat/overlay-ticker                    │
│  ├─ Write code following CONTRIBUTING.md standards          │
│  ├─ Verify: bash scripts/verify.sh + scene-route 200        │
│  ├─ Append to worklog.md (Rule 1 — non-rollbackable)        │
│  ├─ Push to GitHub                                           │
│  └─ Open a PR + give you the preview URL                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ git push
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB (github.com/RKW-Kim/smile-live-kit)                  │
│  ├─ Receives the feat/* branch                              │
│  ├─ Runs CI (lint + typecheck + build + dev-server)         │
│  └─ Triggers Vercel preview build                           │
└──────────────────┬──────────────────────────────────────────┘
                   │ webhook
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  VERCEL (smile-live-kit.vercel.app)                          │
│  ├─ Builds a PREVIEW at smile-live-kit-git-<sha>-rkwkim22.vercel.app  │
│  ├─ You review the preview                                  │
│  ├─ You say "merge it" → I merge the PR                     │
│  └─ main updates → PRODUCTION auto-deploys                  │
└─────────────────────────────────────────────────────────────┘
```

---

## How To Talk To Me (Best Practices)

### ✅ Good prompts (specific + actionable):
- "Add the `/overlays/ticker` route. Transparent body, scrolls at 60px/sec, leading edge in Trading Cyan. Reference `docs/handoff/06-SCENE_MODEL.md` §"The Ticker" and `docs/handoff/10-DATA_FEEDS.md`."
- "The W21 mark's status dot glow is too strong — reduce the glow radius from 16% to 12% of size. Branch: `fix/mark-glow`." (NOTE: per Rule 2, this would require human approval — the mark is sacred. The AI would flag it and ask for confirmation before touching `W21Mark.tsx`.)
- "Research how OBS implements the Stream Delay feature, then implement it in the console's StreamHealthPanel."
- "Fix the TypeScript error in `src/components/scene/Ticker.tsx` line 217 — `price` is possibly null."

### ❌ Vague prompts (I'll ask for clarification):
- "Make it better." (What specifically?)
- "Add more features." (Which ones?)
- "Fix the bugs." (Which bugs?)

### The ideal prompt structure:
```
WHAT: <the feature/fix/research>
WHERE: <which file/component/route, if known>
WHY: <the motivation — user request, OBS parity, bug report, vertical strategy>
REFERENCE: <any doc, link, screenshot, or research source>
BRANCH: <suggested branch name, or let me pick>
```

Example:
```
WHAT: Add the /scenes/starting-soon route
WHERE: src/app/scenes/starting-soon/page.tsx + src/components/scene/Countdown.tsx
WHY: Phase 0 pre-launch checklist — needs a pre-roll scene before going live
REFERENCE: docs/handoff/06-SCENE_MODEL.md §"Scene Presets" + docs/verticals/w21-trading/LAUNCH_ROADMAP.md Phase 0
BRANCH: feat/scene-starting-soon
```

---

## The Preview-Review-Merge Loop

### When I finish a task:

```
ME: "Done! Here's what I did:
     - Created branch: feat/overlay-ticker
     - Added /overlays/ticker route (transparent body, 1920×1080)
     - Added src/components/scene/Ticker.tsx (subscribes to Socket.io data:tick)
     - Leading edge in Trading Cyan #00F0FF, mono prices, scrolls at 60px/sec
     - Worklog updated, CI passing ✅
     
     Preview URL: https://smile-live-kit-git-<sha>-rkwkim22.vercel.app/overlays/ticker
     PR: https://github.com/RKW-Kim/smile-live-kit/pull/XX
     
     Review type: needs-human-review
     What to check:
     1. Open the preview URL — confirm the ticker scrolls at the bottom.
     2. Confirm the body is transparent (overlay routes must be transparent).
     3. Confirm the leading edge is Trading Cyan #00F0FF.
     4. Confirm prices are monospaced and don't jitter.
     
     Review the preview and let me know: merge it, or fix something?"

YOU: [open the preview URL, click around]

Option A: "Looks great, merge it."
   → I merge the PR → main updates → production deploys → done ✅

Option B: "The leading edge is too thick, make it 2px instead of 4px."
   → I fix on the same branch → push → new preview → you review again

Option C: "This is wrong — the ticker should scroll right-to-left, not left-to-right."
   → I re-read the spec → fix → push → new preview → you review
```

### You are always in control of production.
**I never merge a `needs-human-review` PR without your explicit "merge it."** I MAY self-merge an `ai-verified` PR (no visible change) after verification, then inform you.

---

## When To Self-Merge (ai-verified PRs)

For PRs with NO visible change — backend, types, lint, docs, config, refactors with no UI effect — I verify (lint + tsc + dev 200 + agent-browser 0 errors) and self-merge, then tell you:

```
ME: "Merged PR #X (ai-verified) — refactored the TickerEditor's symbol-chip
     parsing into a separate function. Nothing for you to check.
     - lint: 0 errors
     - tsc: 0 errors
     - dev: 200
     - agent-browser: 0 page errors (no regression)
     Production is updating."
```

You're informed but not blocked. If something breaks, Vercel's instant rollback restores the previous deploy.

See [`PR_REVIEW_PROCESS.md`](PR_REVIEW_PROCESS.md) for the full review-routing system.

---

## Common Scenarios

### "I want to see what you did"
1. I'll give you a preview URL (Vercel).
2. Open it, click around.
3. The worklog entry (I'll paste it in chat) has the details.

### "Something broke in production"
1. Go to [vercel.com](https://vercel.com) → Deployments.
2. Find the last known-good deploy.
3. Click "Instant Rollback".
4. Tell me what broke — I'll fix on a branch.

### "I want to try a different approach"
1. Tell me: "Scrap the Socket.io transport, let's try Server-Sent Events instead."
2. I write an ADR (`docs/adr/`) documenting the decision + rejected alternatives.
3. I create a new branch, implement the new approach.
4. New preview URL.
5. You compare the two previews, pick the better one.

### "I want to work on it myself"
1. Clone the repo: `git clone https://github.com/RKW-Kim/smile-live-kit.git`.
2. Set the git author: `git config user.name "RKW-Kim" && git config user.email "rkw.kim22@gmail.com"`.
3. Create a branch: `git checkout -b feat/my-thing`.
4. Edit, commit, push.
5. Open a PR on GitHub.
6. Vercel builds a preview.
7. You can ask me to review it, or merge it yourself.

### "I want a different AI to take over"
1. The other AI clones the repo.
2. Runs `bash scripts/agent-bootstrap.sh` (sets git identity + installs deps + pushes schema + starts dev).
3. Reads `README.md` → `AGENTS.md` → `docs/handoff/CURRENT_STATE.md` → `docs/handoff/AI_BRIEFING.md` → the last 3-5 `worklog.md` entries.
4. Continues exactly where I left off.
5. The worklog + docs mean **zero context loss**.

---

## The Sacred Rules (Reminder)

1. **Worklog is non-rollbackable** — every session appends to `/worklog.md` (repo root) before AND after work.
2. **The W21 mark is sacred** — `src/components/w21/W21Mark.tsx` is read-only. The ONLY variable is color (per channel).
3. **OBS is the gold standard** — every feature traces to OBS or a proven community plugin.

See [`AGENTS.md`](../../AGENTS.md) for the full protocol.

---

## Your Vercel URL

**Production:** [https://smile-live-kit.vercel.app/](https://smile-live-kit.vercel.app/) (once you import the repo at [vercel.com/new](https://vercel.com/new)).

**Preview URLs** (per branch): `https://smile-live-kit-git-<vercel-hash>-rkwkim22.vercel.app`. I'll give you the specific preview URL for each task — extracted from the `vercel[bot]` PR comment, never guessed.

---

## The Sandbox Is Ephemeral — GitHub Is The Source Of Truth

The sandbox at `/home/z/my-project/` can reset 1000× — it doesn't matter. GitHub is the source of truth. Vercel deploys from GitHub. The sandbox is just my editing tool. Every commit is a checkpoint. Every PR is a reviewable unit. Every merge is a deploy.

The documentation (`docs/`) is on GitHub. The worklog (`worklog.md`) is on GitHub. The code (`src/`) is on GitHub. The legacy v1 kit is on the `legacy/v1-python-static` branch on GitHub. Everything that matters survives a sandbox reset.

---

*This is our operating manual. Refer back anytime. The ecosystem is: you + me + GitHub + Vercel (preview) + (optionally) a VPS for the 24/7 W21 Trading deployment.*
