# PR Review Process — Who Reviews What, and When to Auto-Merge

> **The problem this solves:** the human can't always tell what changed in a PR. A backend-only PR (types, lint, internal logic) looks identical in the Vercel preview to the previous version — the human has nothing to look at, yet they're the gate. This wastes their time and blocks progress. Conversely, a UI PR needs human eyes because the AI can't fully judge visual quality. This doc defines a two-label system that routes each PR to the right reviewer.

---

## The Two Review Types

Every PR gets exactly ONE of these labels. The AI picks it when opening the PR.

### 🟠 `needs-human-review`

**Use when:** the PR has ANY visible change — a new scene, a recolored overlay, a console layout change, a ticker redesign, an animation, a new/removed UI element, a behavior the operator would feel.

**Workflow:**
1. AI implements + verifies (`bash scripts/verify.sh` + scene-route 200s + `agent-browser` snapshot all green).
2. AI opens the PR, labels it `needs-human-review`.
3. AI fills in the **"👀 What to check in the preview"** section with specific, concrete things for the human to look at (not "review the UI" — but "open `/scenes/trading-live`, confirm the W21 mark renders at 96px in the top-left, the ticker scrolls at 60fps, the channel cyan #00F0FF is the only chromatic color, the body is Terminal Black, the structural grid is visible at ~3% opacity").
4. AI gives the human the real Vercel preview URL (from the `vercel[bot]` PR comment — see [`../deployment/VERCEL_PREVIEW_GUIDE.md`](../deployment/VERCEL_PREVIEW_GUIDE.md)).
5. **AI does NOT merge.** Waits for the human.
6. Human reviews the preview against the checklist → says "merge it" or "fix X".
7. AI merges (squash). Branch auto-deletes. Production updates.

### 🟢 `ai-verified`

**Use when:** the PR has NO visible change — backend, TypeScript types, lint config, docs, build config, refactors with no UI effect, internal logic.

**Workflow:**
1. AI implements + verifies (`bash scripts/verify.sh` all green; `agent-browser` confirms the app still renders with 0 errors — this catches regressions even when there's "nothing new to see").
2. AI opens the PR, labels it `ai-verified`.
3. AI fills in the "👀 What to check" section with: *"Nothing visible — this is [backend/types/docs/config] only, AI-verified. lint=0 errors, tsc=0 errors, dev=200, agent-browser=0 page errors."*
4. **AI self-merges** (squash) via the GitHub API (or the GitHub web UI if `gh` CLI is unavailable). Branch auto-deletes. Production updates.
5. AI tells the human in chat: *"Merged PR #X (`ai-verified`) — [one-line description]. Nothing for you to check. Production is updating."*
6. Human is informed but was never blocked.

> **Safety net:** if an `ai-verified` merge breaks production, Vercel's instant rollback (one click in the Vercel dashboard) restores the previous deployment. The human can also `git revert` the merge commit. Auto-merge is reversible.

---

## How to Decide Which Label

| Question | If YES | If NO |
|----------|--------|-------|
| Would a human opening the Vercel preview see ANY visual difference (layout, color, text, animation, new/removed element)? | `needs-human-review` | → next question |
| Would a human clicking around feel ANY behavior difference (e.g. a button that was broken now works, a hotkey that didn't fire now does)? | `needs-human-review` | → next question |
| Is the change ONLY in types, lint, internal logic, config, or docs? | `ai-verified` | — |

**When unsure → `needs-human-review`.** It's safer to over-review than to auto-merge a visible change the human wanted to see.

### Edge cases

- **Refactor that "shouldn't" change behavior but might:** `needs-human-review` (verify visually that nothing broke).
- **Dependency bump:** `ai-verified` IF the API is unchanged and tests pass; `needs-human-review` if the dep drives UI (e.g. framer-motion major, shadcn/ui primitive update).
- **Fix for a visible bug:** `needs-human-review` (the human should confirm the bug is gone).
- **Docs-only:** `ai-verified` (always — no code changes).
- **Config (eslint/tsconfig/next.config/tailwind.config):** `ai-verified` IF lint/tsc still pass; `needs-human-review` only if it changes build output that affects rendering (rare).
- **Brand-compliance change (touching `src/components/w21/` or `src/lib/w21/channels.ts`):** ALWAYS `needs-human-review` — the W21 mark + channel colors are sacred, and the human must verify compliance visually.
- **New scene/overlay route:** ALWAYS `needs-human-review` — the human must verify the route renders correctly in OBS Browser Source dimensions.
- **New API route with no UI:** `ai-verified` IF the route is fully tested (curl 200, response shape matches Zod schema). The human is informed but doesn't need to look.

---

## The "👀 What to check" Section — How to Write It

For `needs-human-review` PRs, this section is the human's entire review checklist. Bad: *"Review the ticker."* Good:

```
1. Open the preview at https://smile-live-kit-git-<sha>-rkwkim22.vercel.app/overlays/ticker
2. Confirm the body is transparent (you can see through it to the page behind — overlay routes must be transparent).
3. Confirm the ticker scrolls at the bottom of the page, left-to-right at ~60px/sec.
4. Confirm the leading edge (the 4px vertical bar on the left) is Trading Cyan #00F0FF.
5. Confirm each symbol chip (▶ V75, ▶ V100, etc.) has a colored background at ~20% opacity of the channel color.
6. Confirm the prices are monospaced (JetBrains Mono) and don't jitter as digits change.
7. Confirm the W21 mark is NOT on this overlay (overlays are graphics layers — the mark belongs on scenes, not overlays).
8. Confirm there is no structural grid on this overlay (overlays omit the grid per the brand spec).
```

Specific, actionable, ordered. The human should be able to follow it like a recipe and say "merge it" or "step 5 didn't work — the chip background is 30% opacity, make it 20%."

For `ai-verified` PRs:
```
Nothing visible — this is [types/docs/config] only, AI-verified:
- lint: 0 errors
- tsc: 0 errors
- dev: GET / 200
- agent-browser: title correct, 0 page errors (no regression)
- scene-route smoke: /scenes/trading-live 200, /overlays/ticker 200
```

---

## Why This Exists

Before this system, every PR blocked on the human — including pure-backend PRs where the human had nothing to look at. The human would open the preview, see the same UI as before, and have to take the AI's word that "something improved internally." That's not a real review; it's a rubber stamp that wastes the human's time.

This system routes visible changes to human eyes (where they add value) and invisible changes to AI verification (where the AI is actually the better reviewer — it can run lint/tsc/agent-browser, the human can't). The human stays informed of every merge but only spends time where their judgment matters.

---

## Quick Reference for the AI

```
Opening a PR?
1. Did you change anything visible (scene, overlay, console, color, animation, brand component)? → needs-human-review (don't merge, wait for human)
2. Did you touch src/components/w21/ or src/lib/w21/channels.ts? → needs-human-review (brand compliance is sacred)
3. Did you add a new scene/overlay route? → needs-human-review (must verify in OBS dimensions)
4. Only backend/types/docs/config/refactor with no UI effect? → ai-verified (verify, self-merge, inform human)
5. Unsure? → needs-human-review (safer)
```

See also: [`../deployment/SAFEGUARDS.md`](../deployment/SAFEGUARDS.md) (the full safeguard system), [`../deployment/VERCEL_PREVIEW_GUIDE.md`](../deployment/VERCEL_PREVIEW_GUIDE.md) (how to get the real preview URL + verify the build).
