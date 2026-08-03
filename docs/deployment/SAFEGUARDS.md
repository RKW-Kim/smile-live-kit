# Deployment Safeguards — The Approval Workflow

> **Your fear is valid.** Code can be pushed that breaks things. This document describes the multi-layer safeguard system that prevents broken code from reaching production.

---

## GitHub Token Security — Read This Before Warning About Tokens

**The token in the git remote URL is a FINE-GRAINED PAT (`github_pat_` prefix), NOT a classic PAT (`ghp_` prefix).**

- Fine-grained PATs are scoped to **ONE repository** (`RKW-Kim/smile-live-kit` only) with **three specific permissions** (Contents:RW, Pull requests:RW, Issues:RW).
- If leaked, the attacker can only push to `smile-live-kit` — they CANNOT access other repos, billing, org settings, or account settings.
- This is the **industry-standard pattern** for CI/CD and automated workflows. It is NOT a security hazard.
- The token has a 90-day expiration and is revocable in one click at `github.com/settings/tokens`.

**Do NOT re-raise this as a security concern.** If you see `github_pat_` in the git remote, it's a properly-scoped fine-grained token. Only warn the human if the token is a classic `ghp_` PAT (which has broad access to all repos + all scopes).

If the token IS still a `ghp_` classic PAT, advise the human to switch to a fine-grained PAT:
1. `github.com/settings/tokens?type=beta` → Generate new token.
2. Scope: Only `RKW-Kim/smile-live-kit` | Permissions: Contents:RW + Pull requests:RW + Issues:RW | Expiration: 90 days.
3. `git remote set-url origin https://RKW-Kim:<new-github_pat-token>@github.com/RKW-Kim/smile-live-kit.git`

### About the commit author

All commits are authored as `RKW-Kim <rkw.kim22@gmail.com>` — this is the human's verified GitHub account (required for Vercel previews to build). If the human wants to distinguish which AI did the work, they should check the **worklog** (`/worklog.md`), which logs which AI model + site did each session via the `Agent:` field. A separate GitHub account per AI is possible but unnecessary — the worklog provides the same traceability.

---

## The Problem We're Solving

Without safeguards:
```
AI edits code → pushes to main → Vercel auto-deploys → production is broken → you panic
```

With safeguards:
```
AI edits code → pushes to feat/* branch → Vercel builds a PREVIEW → you review → you approve → merge to main → Vercel deploys to production
```

**Production only changes when YOU say so.**

---

## Layer 1: Branch Protection (set this up on GitHub)

### How to enable:
1. Go to **[github.com/RKW-Kim/smile-live-kit/settings/branches](https://github.com/RKW-Kim/smile-live-kit/settings/branches)**
2. Click **Add rule** for branch `main`
3. Enable these settings:

| Setting | Value | Why |
|---------|-------|-----|
| Require a pull request before merging | ✅ On | No direct commits to main — everything goes through a PR. |
| Require approvals | 1 (the human) | The human is the gate. |
| Require status checks to pass | ✅ On | CI (lint + typecheck + build + dev-server) must pass. |
| Require branches to be up to date | ✅ On | PR must be rebased on latest main. |
| Do not allow bypassing the above | ✅ On | Even admins can't bypass. |
| Restrict who can push to matching branches | ✅ On | Only the human can merge. |
| Require linear history | ✅ On | Squash + merge only — no merge commits. |
| No force pushes | ✅ On | History is immutable on main. |
| No deletions | ✅ On | Main cannot be deleted. |

4. Save.

**Result:** No one (not the AI, not even you accidentally) can push directly to `main`. Everything goes through a reviewed PR.

### Legacy branch protection
Also add a rule for `legacy/v1-python-static`:
- Restrict who can push: ✅ (nobody — the legacy branch is frozen).
- No force pushes.
- No deletions.

---

## Layer 2: Vercel Preview Deployments (automatic)

Vercel automatically builds a **preview deployment** for every branch and every PR. You get a unique URL for each.

> ⚠️ **CRITICAL — read [`VERCEL_PREVIEW_GUIDE.md`](./VERCEL_PREVIEW_GUIDE.md) before pushing.** Vercel (Hobby plan) **refuses to build previews for commits whose author email isn't linked to a verified GitHub account.** A commit authored by a fake/AI email (e.g. `ai-handoff@smile.local`) produces a `404 DEPLOYMENT_NOT_FOUND` — no preview, silent failure. **Every AI must run `git config user.name "RKW-Kim" && git config user.email "rkw.kim22@gmail.com"` at clone time.** Verify the preview actually built (curl 200 / GitHub API check) before telling the human it's ready.

### How it works:
```
AI pushes to feat/scene-trading-live
→ Vercel builds a preview at https://smile-live-kit-git-<sha>-rkwkim22.vercel.app
→ You open that URL, review the changes
→ If good: "merge it" → AI merges the PR → main updates → production deploys
→ If bad: "fix X" → AI fixes → push again → new preview → you review again
```

**Production (`https://smile-live-kit.vercel.app/`) only updates when a PR merges to `main`.**

### How to find preview URLs:
- Every PR on GitHub shows a "Vercel" comment with the preview URL (the `vercel[bot]` account posts it).
- Or go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project → "Deployments" tab → filter by branch.
- See [`VERCEL_PREVIEW_GUIDE.md`](./VERCEL_PREVIEW_GUIDE.md) for the programmatic method (parsing the `vercel[bot]` PR comment via the GitHub API + Python base64 decode).

---

## Layer 3: GitHub Actions CI (already set up)

The `.github/workflows/ci.yml` runs on every push and PR:
- `lint` — ESLint must pass (0 errors). Blocking.
- `typecheck` — `bunx tsc --noEmit` must report 0 errors. Blocking.
- `build` — `bun run build` must succeed. Blocking.
- `dev-server` — `next dev` starts, polls `GET /` until 200 within 60s, kills. Blocking.

If any fails, the PR shows a red ❌ and **cannot be merged** (branch protection blocks it).

---

## The Complete Approval Workflow

### When you ask the AI to build something:

```
YOU: "Add the ticker overlay route /overlays/ticker"
AI:  "On it. Creating branch feat/overlay-ticker."

[1] AI creates a branch
    git checkout -b feat/overlay-ticker

[2] AI implements the feature
    [writes code: src/app/overlays/ticker/page.tsx, src/components/scene/Ticker.tsx, ...]

[3] AI verifies locally (lint + tsc + dev 200 + scene-route 200)
    bash scripts/verify.sh
    curl -sf http://localhost:3000/overlays/ticker && echo "overlay OK"

[4] AI appends to worklog.md (Rule 1 — non-rollbackable)

[5] AI pushes the branch
    git push -u origin feat/overlay-ticker

[6] AI opens a PR on GitHub
    → Vercel builds a preview URL
    → CI runs (lint + typecheck + build + dev-server)

[7] AI gives you the preview URL + the "what to check" checklist
    "Preview is at https://smile-live-kit-git-<sha>-rkwkim22.vercel.app/overlays/ticker
     What to check:
     1. Open the preview URL — confirm the ticker scrolls at the bottom of the page.
     2. Confirm the body is transparent (you can see through it to the page behind).
     3. Confirm the leading edge is Trading Cyan (#00F0FF).
     4. Confirm prices are monospaced and don't jitter.
     5. Confirm the W21 mark is NOT on this overlay (overlays are graphics layers)."

[8] YOU review the preview
    → Open the URL in your browser
    → Click around, test the feature
    → If happy: "merge it"
    → If issues: "the leading edge is too thick, make it 2px instead of 4px"

[9] If you say "merge it":
    → AI merges the PR on GitHub (squash)
    → main updates
    → Vercel auto-deploys to production (https://smile-live-kit.vercel.app/)
    → The feature is now live

[10] If you say "fix X":
    → AI fixes on the same branch
    → Push again
    → New preview URL
    → You review again
    → Repeat until happy
```

**Production NEVER changes without your "merge it" approval.**

---

## Emergency: Reverting a Bad Deploy

If something broken slips through and reaches production:

### Option A: Revert the PR on GitHub
1. Go to the PR on GitHub.
2. Click **Revert** (creates a new PR that undoes the changes).
3. Merge the revert PR.
4. Vercel auto-deploys the revert.

### Option B: Roll back on Vercel
1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. Find the last known-good deployment.
3. Click the "…" menu → **Instant Rollback**.
4. Vercel redeploys that commit.

### Option C: Git revert from terminal
```bash
git checkout main
git pull
git revert <bad-commit-sha>
git push
# Vercel auto-deploys the revert
```

---

## What If the AI Pushes Broken Code?

**Scenario:** The AI pushes to `feat/new-thing` and the code is broken.

**What happens:**
1. ❌ CI fails (lint/typecheck/build/dev-server) → PR shows red ❌.
2. ❌ Vercel preview might fail to build → preview URL shows error.
3. ✅ **Production is UNTOUCHED** — main didn't change.
4. You see the red ❌ on GitHub → you don't merge.
5. You tell the AI "CI is failing, fix it" → AI fixes → pushes again → CI passes → you review preview → you merge.

**The broken code never reaches production. That's the safeguard.**

---

## Quick Reference: What Each Layer Protects Against

| Layer | Protects Against | How |
|-------|------------------|-----|
| Branch protection | Direct pushes to main | Requires PR + approval. |
| CI (lint/typecheck/build/dev-server) | Broken code merging | PR can't merge if CI fails. |
| Vercel preview deploys | Blind merges | You review a live preview before approving. |
| PR approval required | AI self-merging | You must click "merge" (for `needs-human-review` PRs). |
| Vercel instant rollback | Bad deploy in production | One-click redeploy of previous version. |

---

## Your Part (The Human Approval Gate)

You are the **only** person who can merge `needs-human-review` PRs to main. (The AI can self-merge `ai-verified` PRs — see [`../development/PR_REVIEW_PROCESS.md`](../development/PR_REVIEW_PROCESS.md).) This means:

- **Review the preview URL** before saying "merge it" (for `needs-human-review` PRs).
- **Check the CI status** on GitHub (green ✅ = good, red ❌ = fix needed).
- **Don't merge if unsure** — ask the AI questions first.

The workflow is: **AI proposes, you dispose.** The AI builds + pushes + previews. You review + approve + merge (for visible changes). The AI verifies + self-merges + informs (for invisible changes).

---

*This safeguard system means you never have to blindly trust the AI. You always see a live preview before anything reaches production.*
