# 16 — WORKFLOW FEASIBILITY

## Can This Environment Do GitHub + Vercel Development?

**YES.** This sandbox environment CAN do the full GitHub → CI/CD → Vercel workflow. Here's the assessment + the exact procedure.

---

## Environment Capability Assessment

### Tools Available (✅)

| Tool | Path | Version | Purpose |
|------|------|---------|---------|
| `git` | `/usr/bin/git` | system | Version control, push/pull, branch management. |
| `curl` | `/usr/bin/curl` | system | GitHub API calls, Vercel health checks, downloading assets. |
| `wget` | `/usr/bin/wget` | system | File downloads (rclone, scripts). |
| `bun` | `/usr/local/bin/bun` | system | Package manager, runtime, bundler. Matches CI. |
| `node` | `/usr/bin/node` | system | JS runtime (for tooling, for shadcn CLI). |
| `python3` | `/usr/bin/python3` | system | Scripting (Vercel API token parsing, base64 decoding the vercel[bot] PR comment). |
| `zip` / `tar` | `/usr/bin/zip` / `/usr/bin/tar` | system | Archive creation. |

### Tools NOT Available (❌)

| Tool | Why Needed | Workaround |
|------|------------|------------|
| `ssh` | SSH key auth to GitHub | Use HTTPS + PAT (already configured in the git remote). |
| `gh` (GitHub CLI) | Easy repo/auth management, PR creation via CLI | Use `git` + `curl` to GitHub API. PRs are created via the GitHub web UI or via `curl` POST to `/repos/.../pulls`. |
| `~/.ssh/` keys | SSH push | Use HTTPS PAT URL (already configured). |
| `vercel` CLI | Direct Vercel deployment | Not needed — Vercel deploys from GitHub automatically on push. |

### Network Access (✅ Verified)

| Service | Status | URL |
|---------|--------|-----|
| GitHub | ✅ Reachable | `https://github.com` |
| GitHub API | ✅ Reachable | `https://api.github.com` |
| Vercel | ✅ Reachable | `https://vercel.com` |
| Vercel deployments | ✅ Reachable | `https://*.vercel.app` |
| Deriv API | ✅ Reachable | `wss://ws.derivws.com` |
| Twelve Data API | ✅ Reachable | `https://api.twelvedata.com` |

**Conclusion:** Full outbound internet access. Can reach all CI/CD platforms + all market-data APIs.

---

## The Workflow (How It Works)

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  This Sandbox Environment                            │
│  ┌───────────────┐                                   │
│  │  AI/Chat (me) │                                   │
│  │  + git + curl │                                   │
│  └───────┬───────┘                                   │
│          │ git push (HTTPS + fine-grained PAT)       │
│          ▼                                           │
│  ┌───────────────┐                                   │
│  │  Local clone  │ ← /home/z/my-project (working dir)│
│  └───────┬───────┘                                   │
└──────────┼──────────────────────────────────────────┘
           │
           │ HTTPS push to GitHub
           ▼
┌─────────────────────────────────────────────────────┐
│  GitHub (github.com/RKW-Kim/smile-live-kit)          │
│  ┌───────────────┐   ┌───────────────┐               │
│  │  Source code  │   │  docs/        │               │
│  │  (src/)       │   │  (handoff)    │               │
│  └───────┬───────┘   └───────────────┘               │
│          │                                           │
│          │ Webhook on push                           │
└──────────┼──────────────────────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────────────────┐
│ Vercel  │ │ GitHub Actions CI   │
│ (Next   │ │ (lint + tsc + build │
│  app +  │ │  + dev-server 200)  │
│ scenes) │ │                     │
└─────────┘ └─────────────────────┘
     │
     ▼
   https://smile-live-kit.vercel.app
   https://smile-live-kit-git-<sha>-rkwkim22.vercel.app (preview)
```

### The Development Loop

1. **AI edits code + docs** in `/home/z/my-project/` (local working directory).
2. **AI tests locally** via `bun run dev` (port 3000) + `bash scripts/verify.sh`.
3. **AI verifies with `agent-browser`** (optional — opens `localhost:3000`, snapshots the page, confirms the scene renders).
4. **AI appends to `worklog.md`** (before AND after work — Rule 1).
5. **AI commits + pushes** to GitHub via `git push` (HTTPS + fine-grained PAT).
6. **GitHub webhook triggers** Vercel + GitHub Actions.
7. **GitHub Actions** runs CI (lint + typecheck + build + dev-server).
8. **Vercel deploys** the Next.js app to a preview URL (for branches) or production URL (for main).
9. **AI extracts the real preview URL** from the `vercel[bot]` PR comment (see `docs/deployment/VERCEL_PREVIEW_GUIDE.md`).
10. **AI opens a PR** on GitHub, picks the review type.
11. **Human reviews** the preview (for `needs-human-review` PRs) → "merge it" or "fix X".
12. **On merge** → `main` updates → Vercel auto-deploys to production.

---

## What I Need From You (The User)

### 1. The GitHub Repo (DONE)
The repo `github.com/RKW-Kim/smile-live-kit` is created + the git remote is configured with the fine-grained PAT. No action needed.

### 2. The Vercel Project (one-time setup)
1. Sign up at [vercel.com](https://vercel.com) with the GitHub account `RKW-Kim`.
2. Go to [vercel.com/new](https://vercel.com/new) → import the `RKW-Kim/smile-live-kit` repo.
3. Vercel auto-detects Next.js → **Deploy**.
4. The Vercel project name: `smile-live-kit` (recommended).
5. Set the environment variables (see `docs/handoff/13-GITHUB_MIGRATION_GUIDE.md` §4):
   - `DATABASE_URL` (PostgreSQL for prod; ephemeral SQLite for preview).
   - `DERIV_API_TOKEN` (server-side only).
   - `TWELVEDATA_API_KEY` (server-side only).
   - `NEXT_PUBLIC_SOCKETIO_URL` (if using a separate Socket.io host — see §5 of the migration guide).

### 3. Branch Protection (one-time setup)
Go to `github.com/RKW-Kim/smile-live-kit/settings/branches` → add a rule for `main`:
- Require PR before merging: ✅
- Require approvals: 1
- Require status checks: lint, typecheck, build, dev-server
- Require linear history (squash + merge): ✅
- No force pushes, no deletions: ✅

Also add a rule for `legacy/v1-python-static`:
- Restrict who can push: ✅ (nobody — the legacy branch is frozen).

---

## How I Push (Technical Procedure)

### Step 1: Verify the git author (EVERY session)
```bash
cd /home/z/my-project
git config user.name    # must print: RKW-Kim
git config user.email   # must print: rkw.kim22@gmail.com
```
If wrong:
```bash
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```

### Step 2: Branch
```bash
git checkout main && git pull
git checkout -b feat/<your-feature>
```

### Step 3: Implement + verify
```bash
# ... write code ...
bash scripts/verify.sh          # full suite
# OR
bash scripts/verify.sh --quick  # lint + tsc only
```

### Step 4: Append to worklog
```bash
# Append to /home/z/my-project/worklog.md using the standard format (Rule 1).
```

### Step 5: Commit + push
```bash
git add -A
git commit -m "<type>(<scope>): <description> [Task ID: <id>]"
git push -u origin feat/<your-feature>
```

### Step 6: Open a PR
- Via the GitHub web UI (recommended for the human's review convenience).
- Or via `curl` POST to `https://api.github.com/repos/RKW-Kim/smile-live-kit/pulls` (the AI can do this if `gh` CLI is not available).

### Step 7: Wait for CI + Vercel
- GitHub Actions CI runs (~2-3 min).
- Vercel builds the preview (~1-2 min).
- The `vercel[bot]` posts a comment on the PR with the preview URL.

### Step 8: Extract the real preview URL
Per `docs/deployment/VERCEL_PREVIEW_GUIDE.md` Method A — parse the `vercel[bot]` PR comment via the GitHub API + Python base64 decode.

### Step 9: Verify the build succeeded
```bash
SHA=$(git rev-parse HEAD)
curl -s -H "Authorization: token <PAT>" \
  "https://api.github.com/repos/RKW-Kim/smile-live-kit/commits/$SHA/status" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('overall:', d['state']); [print(' ', s['context'], '->', s['state']) for s in d.get('statuses',[])]"
# Expect: overall: success, Vercel -> success
```

### Step 10: Give the human the preview URL (for `needs-human-review`)
Paste the real preview URL + the "what to check" checklist into chat. Wait for "merge it".

---

## What CANNOT Be Done From This Environment

### 1. SSH-based git operations
No `ssh` command, no `~/.ssh/` keys. All git operations use HTTPS + PAT (already configured).

### 2. GitHub OAuth device flow
No `gh` CLI. Cannot do the OAuth dance. PRs are created via the GitHub web UI or via `curl` to the GitHub API.

### 3. Vercel CLI deployment
`vercel` CLI is not installed. Deployment happens via the GitHub integration (auto-deploy on push). This is BETTER — the human doesn't need to give the AI Vercel credentials; Vercel watches the GitHub repo.

### 4. Viewing the deployed site in a real browser
The AI cannot open a real browser at the Vercel URL. But the AI CAN:
- `curl` the Vercel URL to verify it responds.
- Use `agent-browser` to open `localhost:3000` (the dev server) for visual verification.
- Read Vercel deploy logs via their API (if the human provides a Vercel token).

### 5. Running the production app 24/7
The sandbox is ephemeral — it resets. The production app must run on Vercel (or a VPS for the 24/7 W21 Trading deployment). The sandbox only does development + pushing.

---

## The Full CI/CD Pipeline (Once Set Up)

### On every `git push` to `main`:
1. **GitHub Actions** runs CI (lint + typecheck + build + dev-server). If any fails, the commit is marked failed.
2. **Vercel** auto-deploys to production (`https://smile-live-kit.vercel.app`).

### On every PR:
1. **GitHub Actions** runs CI.
2. **Vercel** builds a preview deployment.
3. The `vercel[bot]` posts a comment with the preview URL.
4. The human reviews the preview (for `needs-human-review` PRs).
5. The human merges → `main` updates → production deploys.

---

## Why This Is Better Than the Sandbox-Only Approach

### Problem with the sandbox-only approach:
1. **Single point of failure** — sandbox reset = total loss. (Happened to the WBS reference repo; documented in their `00-MASTER-HANDOFF-INDEX.md` §"A Note on the Revert".)
2. **No collaboration** — only one AI/chat at a time.
3. **No persistent hosting** — the app dies when the sandbox resets.
4. **No CI** — no automated tests/builds on push.
5. **No deploy preview** — can't share a URL with stakeholders.

### Benefits of the GitHub + Vercel approach:
1. **Immutable history** — every commit is a checkpoint. `git revert` if something breaks.
2. **Multi-agent collaboration** — multiple AIs/chats can work on branches; PRs merge.
3. **Persistent hosting** — Vercel runs 24/7, independent of the sandbox.
4. **CI/CD** — GitHub Actions lint + typecheck + build + dev-server on every push.
5. **Deploy previews** — every PR gets a Vercel preview URL for review.
6. **Portability** — the user can move to any machine, any AI, any time. The repo is the source of truth.
7. **The sandbox becomes a dev environment only** — it edits + pushes, but the production app lives elsewhere.

---

## Ready to Proceed

Once you (the human):
1. **Set up the Vercel project** (one-time — [vercel.com/new](https://vercel.com/new) → import `RKW-Kim/smile-live-kit`).
2. **Set the env vars** in Vercel (DATABASE_URL, DERIV_API_TOKEN, TWELVEDATA_API_KEY).
3. **Set up branch protection** on GitHub (one-time — `settings/branches`).

I (the AI) will:
1. **Edit code + docs** in the sandbox.
2. **Verify locally** via `bash scripts/verify.sh`.
3. **Append to `worklog.md`**.
4. **Commit + push** to `feat/<branch>`.
5. **Open a PR** + pick the review type.
6. **Extract the real preview URL** from the `vercel[bot]` comment.
7. **Give you the preview URL** + the "what to check" checklist (for `needs-human-review` PRs).

The documentation is ready. The environment is ready. The workflow is established.

---

*This document is the bridge between the sandbox and the persistent GitHub-based workflow.*
