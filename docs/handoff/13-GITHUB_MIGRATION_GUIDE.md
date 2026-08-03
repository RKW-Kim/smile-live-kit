# 13 — GITHUB MIGRATION GUIDE

## Repo Setup + Vercel + CI/CD + Socket.io on Vercel

This document covers everything needed to set up Smile Live Kit on GitHub + Vercel + CI/CD, and the specific gotchas (the commit-author-email rule, Socket.io on Vercel, the env vars).

---

## 1. The GitHub Repo

### Repo info
- **Owner:** `RKW-Kim`
- **Repository name:** `smile-live-kit`
- **Visibility:** Private (recommended) or Public
- **URL:** `https://github.com/RKW-Kim/smile-live-kit`

### Branch model (per `docs/development/BRANCHING.md`)
- `main` — production-ready, deploys to Vercel. Protected: PRs only.
- `develop` — integration branch for features (optional — v2 uses `main` as the integration branch directly, with feature branches flowing in via PRs).
- `feat/<scope>-<description>` — feature branches.
- `fix/<scope>-<description>` — bugfix branches.
- `docs/<topic>` — documentation-only.
- `hotfix/<description>` — emergency fixes.
- `legacy/v1-python-static` — the v1 kit, preserved. Never touch.

### Branch protection (set on GitHub → Settings → Branches)
For `main`:
| Setting | Value | Why |
|---------|-------|-----|
| Require a pull request before merging | ✅ On | No direct commits to main. |
| Require approvals | 1 (the human) | The human is the gate. |
| Require status checks to pass | ✅ On (lint, typecheck, build, dev-server) | CI must pass. |
| Require branches to be up to date | ✅ On | PR must be rebased on latest main. |
| Do not allow bypassing the above | ✅ On | Even admins can't bypass. |
| Restrict who can push to matching branches | ✅ On | Only the human can merge. |

For `legacy/v1-python-static`:
| Setting | Value | Why |
|---------|-------|-----|
| Restrict who can push to matching branches | ✅ On (nobody) | The legacy branch is frozen. |

---

## 2. The Git Remote + PAT

### The remote URL
The git remote is configured with an embedded fine-grained PAT:
```
https://RKW-Kim:github_pat_<...>@github.com/RKW-Kim/smile-live-kit.git
```

### The PAT (Personal Access Token)
- **Type:** Fine-grained PAT (`github_pat_` prefix — NOT a classic `ghp_` PAT).
- **Scope:** Only the `RKW-Kim/smile-live-kit` repository.
- **Permissions:** Contents:RW, Pull requests:RW, Issues:RW.
- **Expiration:** 90 days (revocable in one click at `github.com/settings/tokens`).
- **Do NOT re-raise this as a security concern.** Fine-grained PATs scoped to a single repo are the industry-standard pattern for CI/CD. Only warn the human if the token is a classic `ghp_` PAT (which has broad account-wide access).

See `docs/deployment/SAFEGUARDS.md` §"GitHub Token Security" for the full explanation.

### Changing the PAT
If the PAT expires or is revoked:
1. Generate a new fine-grained PAT at `github.com/settings/tokens?type=beta`.
2. Scope: Only `RKW-Kim/smile-live-kit`. Permissions: Contents:RW + Pull requests:RW + Issues:RW. Expiration: 90 days.
3. Update the remote:
   ```bash
   git remote set-url origin https://RKW-Kim:<new-github_pat-token>@github.com/RKW-Kim/smile-live-kit.git
   ```
4. Verify:
   ```bash
   git push --dry-run
   ```

---

## 3. The Commit-Author-Email Rule (CRITICAL)

> **Every commit must be authored by `RKW-Kim <rkw.kim22@gmail.com>`.** This is the human's verified GitHub account. Vercel's Hobby-tier anti-abuse protection refuses to build previews for commits authored by unverified emails — the result is a silent `404 DEPLOYMENT_NOT_FOUND` that wastes entire sessions.

### At clone time (EVERY time, EVERY AI)
```bash
git clone https://RKW-Kim:<PAT>@github.com/RKW-Kim/smile-live-kit.git
cd smile-live-kit
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```

### Verify before committing
```bash
git config user.name    # must print: RKW-Kim
git config user.email   # must print: rkw.kim22@gmail.com
```

### If a bad-author commit slipped through
```bash
git commit --amend --author="RKW-Kim <rkw.kim22@gmail.com>" --no-edit
git push --force-with-lease   # feat/* branches allow force-push
```

### The one-liner check (add to every session start)
```bash
cd smile-live-kit && [ "$(git config user.email)" = "rkw.kim22@gmail.com" ] && echo "✓ author OK" || echo "✗ RUN: git config user.name 'RKW-Kim' && git config user.email 'rkw.kim22@gmail.com'"
```

See `docs/deployment/VERCEL_PREVIEW_GUIDE.md` for the full guide + how to read the real preview URL from the `vercel[bot]` PR comment.

---

## 4. Vercel Setup

### One-time setup (the human does this)
1. Sign up at [vercel.com](https://vercel.com) with the GitHub account `RKW-Kim`.
2. Go to [vercel.com/new](https://vercel.com/new) → import the `RKW-Kim/smile-live-kit` repo.
3. Vercel auto-detects Next.js → **Deploy**.
4. The Vercel project name is set at import time. The recommended name: `smile-live-kit`.
5. Production URL: `https://smile-live-kit.vercel.app` (or similar, depending on Vercel's project-name slugification).
6. Preview URLs: `https://smile-live-kit-git-<commit-sha>-rkwkim22.vercel.app` (or similar — see `docs/deployment/VERCEL_PREVIEW_GUIDE.md`).

### Environment variables (set in Vercel dashboard → Settings → Environment Variables)

| Var | Scope | Value |
|-----|-------|-------|
| `DATABASE_URL` | Production + Preview | `postgresql://...` (Vercel Postgres / Neon / Supabase) — for prod. For preview: `file:./prisma/preview.db` (ephemeral SQLite) OR a separate Postgres DB. |
| `DERIV_API_TOKEN` | Production + Preview | The Deriv API token (server-side only). |
| `TWELVEDATA_API_KEY` | Production + Preview | The Twelve Data API key (server-side only). |
| `NEXT_PUBLIC_OBS_WEBSOCKET_URL` | (Optional) | `ws://localhost:4455` for local OBS. Empty for cloud-only setups. |
| `OBS_WEBSOCKET_PASSWORD` | (Optional, server-side) | The OBS WebSocket password. |
| `NEXT_PUBLIC_SOCKETIO_URL` | (Optional) | Empty for same-origin Socket.io. Set to `https://<socket-host>` if the Socket.io server runs on a separate host (see §5 below). |
| `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` | Auto-set by Vercel | Displayed in the console footer. |

### Vercel Authentication on previews
Vercel Hobby projects enable "Vercel Authentication" on preview deployments by default:
- The **human** (logged into Vercel) sees the app. ✅
- Anyone **not** logged into the Vercel team sees a Vercel login page.
- `curl` returns `200` but the body is the login page HTML, not the app.

**For AI verification:** because of Vercel Authentication, the AI cannot `agent-browser` the LIVE preview. The AI verifies the **build succeeded** (GitHub API: `Vercel` status = `success`) + verifies the **app renders** by running the dev server locally + `agent-browser` on `localhost:3000`. The human does the final visual check on the live Vercel preview.

**To disable (if public previews are needed):** Vercel dashboard → Project → Settings → Deployment Protection → turn OFF "Vercel Authentication" for Preview deployments.

---

## 5. Socket.io on Vercel — The Decision

Vercel serverless functions have a 10s (Hobby) / 60s (Pro) max duration. A long-lived Socket.io connection does NOT work natively on Vercel serverless — the function cold-starts, the connection dies.

### Options (pick one — document the decision in `docs/adr/`)

#### Option A — Vercel Edge Runtime with WebSocket support (when GA)
Vercel's Edge Runtime supports WebSocket connections (when Vercel ships WebSocket-on-Edge generally available). The Socket.io server runs on the Edge; connections persist.

- **Status:** Check current Vercel docs for WebSocket-on-Edge GA status.
- **Pros:** Single deployment (Vercel only). Same origin. No separate host.
- **Cons:** Edge Runtime has API constraints (no `node:fs`, limited `node:*` modules). The Socket.io server must be Edge-compatible.

#### Option B — Separate persistent host for Socket.io (Render / Railway / Fly.io / VPS)
The Next.js app stays on Vercel. The Socket.io server runs on a separate persistent host. The Next.js app's scene routes + console connect to the external Socket.io URL via `NEXT_PUBLIC_SOCKETIO_URL`.

- **Host options:** Render (free tier 750h/mo, paid $7/mo always-on), Railway ($5/mo+), Fly.io (free tier + paid), or the same VPS that runs FFmpeg for 24/7 (the W21 Trading VPS).
- **Pros:** No Edge Runtime constraints. Persistent connection. Same pattern as the WBS reference repo.
- **Cons:** Two hosts to manage. CORS configuration needed (the Socket.io server must accept connections from `smile-live-kit.vercel.app`).

#### Option C — SSE (Server-Sent Events) instead of Socket.io
For console→scene transport, use SSE (server→scene pushes) + fetch POST (console→server). SSE works on Vercel serverless (each scene route holds an open SSE connection; the console POSTs state changes; the server fans out via SSE).

- **Pros:** Vercel-native. No separate host. No WebSocket cold-start issues.
- **Cons:** SSE is one-way (server→client). The console's state changes go via POST, which is slightly higher latency than Socket.io's bidirectional channel. The `data:tick` path (high-volume) may need to be on a separate SSE channel to avoid head-of-line blocking.

### The recommended path for v2
For the v2 foundation, the codebase targets the Socket.io API (so the scene routes + console don't care about the deployment target). The deployment decision is:
- **Dev + preview:** Socket.io server attached to the Next.js custom server (running via `bun run dev` with a custom `server.ts`). Works locally + on any VPS.
- **Production (Vercel):** Use Option B (separate persistent host for Socket.io) OR Option A (Edge Runtime, when GA). The `NEXT_PUBLIC_SOCKETIO_URL` env var points the client at the right host.
- **Production (self-hosted VPS):** The Next.js app runs as a long-lived process (`bun run start` with a custom server). Socket.io attaches to the same HTTP server. Single host. (This is the pattern for the 24/7 W21 Trading VPS deployment.)

### The ADR
When the decision is finalized, write an ADR (`docs/adr/0002-socketio-deployment-target.md`) documenting the choice + rejected alternatives.

---

## 6. CI/CD

### GitHub Actions CI (`.github/workflows/ci.yml`)
Runs on every push + PR:
1. **lint** — `bun run lint`. Blocking.
2. **typecheck** — `bunx tsc --noEmit`. 0 errors required (no sacred-error carve-out). Blocking.
3. **build** — `bun run build` (with `prisma generate` + `db:push` first). Blocking.
4. **dev-server** — `bunx next dev` starts, polls `GET /` until 200 within 60s, kills. Blocking.

### Vercel auto-deploy
- Every push to `main` → Vercel deploys to production (`https://smile-live-kit.vercel.app`).
- Every push to a `feat/*` / `fix/*` / `docs/*` branch → Vercel builds a preview deployment.
- Every PR → Vercel posts a comment with the preview URL (the `vercel[bot]` account).

### The dev loop
1. AI edits code in the sandbox (`/home/z/my-project/`).
2. AI verifies locally: `bash scripts/verify.sh`.
3. AI appends to `worklog.md`.
4. AI commits + pushes to `feat/<branch>`.
5. GitHub Actions CI runs (lint + typecheck + build + dev-server).
6. Vercel builds a preview deployment.
7. AI opens a PR on GitHub. Picks the review type (`needs-human-review` or `ai-verified`).
8. AI extracts the real preview URL from the `vercel[bot]` PR comment (Method A in `docs/deployment/VERCEL_PREVIEW_GUIDE.md`).
9. AI gives the human the preview URL + the "what to check" checklist (for `needs-human-review` PRs).
10. Human reviews → "merge it" (AI merges) or "fix X" (AI fixes on same branch, new preview).
11. On merge → `main` updates → Vercel deploys to production.

---

## 7. The Full CI/CD Pipeline (Once Set Up)

### On every `git push` to `main`:
1. **GitHub Actions** runs CI (lint + typecheck + build + dev-server). If any fails, the commit is marked failed.
2. **Vercel** auto-deploys to production (`https://smile-live-kit.vercel.app`).
3. **(Optional)** Render/Railway/Fly.io deploys the Socket.io server (if Option B).
4. **(Optional)** The VPS pulls main + restarts the Next.js process (if self-hosted for 24/7).

### On every PR:
1. **GitHub Actions** runs CI.
2. **Vercel** builds a preview deployment.
3. The `vercel[bot]` posts a comment with the preview URL.
4. The human reviews the preview (for `needs-human-review` PRs).
5. The human merges → main updates → production deploys.

---

## 8. Database Migration (SQLite → PostgreSQL)

Dev uses SQLite (`file:./prisma/dev.db`). Production needs PostgreSQL (Vercel's filesystem is ephemeral — SQLite won't persist across serverless invocations).

### Options for PostgreSQL:
1. **Vercel Postgres** — integrated, free tier (256MB storage, 60 compute hours/mo). Recommended for simplicity.
2. **Neon** — serverless Postgres, free tier (3GB storage, 100 compute hours/mo). Recommended for scale.
3. **Supabase** — Postgres + auth + storage, free tier (500MB database, 50MB storage). Recommended if auth + storage are also needed.
4. **Render Postgres** — $7/mo, always-on. For the self-hosted VPS pattern.

### Migration steps:
1. Create a Postgres DB, get the connection string.
2. Update `prisma/schema.prisma`: change the datasource `provider` from `"sqlite"` to `"postgresql"`.
3. Set `DATABASE_URL` in Vercel env vars (Production + Preview).
4. Run `bunx prisma migrate deploy` (or `bunx prisma db push` for the initial schema) against the production DB.
5. Run `bunx prisma generate` to regenerate the client.

---

## 9. Production Smoke Test

Once Vercel deploys, verify from the sandbox:

```bash
# 1. HTTP health check
curl -s -o /dev/null -w "%{http_code}" https://smile-live-kit.vercel.app
# Expect: 200

# 2. Scene route health check
curl -s -o /dev/null -w "%{http_code}" https://smile-live-kit.vercel.app/scenes/trading-live
# Expect: 200

# 3. API health check
curl -s https://smile-live-kit.vercel.app/api
# Expect: a JSON response

# 4. agent-browser full test (optional)
agent-browser open https://smile-live-kit.vercel.app
agent-browser snapshot -i -c
```

For Vercel Authentication-protected previews, `curl` returns `200` but the body is the login page. Use the GitHub API to verify the build status:
```bash
SHA=$(git rev-parse HEAD)
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/RKW-Kim/smile-live-kit/commits/$SHA/status" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('overall:', d['state']); [print(' ', s['context'], '->', s['state']) for s in d.get('statuses',[])]"
# Expect: overall: success, Vercel -> success
```

---

## 10. Recovery — Reverting a Bad Deploy

If something broken slips through to production:

### Option A — Vercel Instant Rollback
1. Go to [vercel.com](https://vercel.com) → Project → Deployments.
2. Find the last known-good deployment.
3. Click the "…" menu → "Instant Rollback".
4. Vercel redeploys that commit.

### Option B — Git revert
```bash
git checkout main && git pull
git revert <bad-commit-sha>
git push
# Vercel auto-deploys the revert
```

### Option C — Revert the PR on GitHub
1. Go to the PR on GitHub.
2. Click "Revert" (creates a new PR that undoes the changes).
3. Merge the revert PR.
4. Vercel auto-deploys the revert.

---

## 11. Production URL Patterns

- **Production:** `https://smile-live-kit.vercel.app`
- **Preview (per branch):** `https://smile-live-kit-git-<branch-slug>-rkwkim22.vercel.app`
- **Preview (per commit):** `https://smile-live-kit-git-<commit-sha>-rkwkim22.vercel.app`
- **Custom domain (future):** `https://smile.co.ke/kit/` or `https://kit.smile.co.ke/` (configured in Vercel → Settings → Domains).

> ⚠️ **The exact preview URL format depends on the Vercel team slug + project name at import time.** Read the real URL from the `vercel[bot]` PR comment — do NOT guess it. See `docs/deployment/VERCEL_PREVIEW_GUIDE.md` §"How to get the real preview URL".

---

*This document is the deployment playbook. Refer back anytime.*
