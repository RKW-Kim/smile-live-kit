# Vercel Preview Deployments — The Complete Guide

> **Read this before pushing any branch.** A wrong commit-author email silently breaks every preview. This doc explains the formula, how to verify a preview actually built, and how to troubleshoot the `404 DEPLOYMENT_NOT_FOUND` error.

---

## The One Rule That Matters Most

**Every commit must be authored by an email that is linked to a verified GitHub account.**

For this repo, that account is **`RKW-Kim`** with email **`rkw.kim22@gmail.com`**.

If a commit is authored by a fake/AI email (e.g. `ai-handoff@smile.local`, `z@container`, `Z User <z@container>`), Vercel's Hobby-tier anti-abuse protection refuses to build the preview deployment. The result:

- GitHub PR shows a failing check: **"Vercel — GitHub couldn't verify an account for the commit."**
- The preview URL returns **`404: NOT_FOUND` / `DEPLOYMENT_NOT_FOUND`** — because no deployment was ever created.
- Production (on merge to main) can ALSO fail for the same reason.

### Why this happens

Vercel's GitHub integration, on the free **Hobby** plan, verifies that the commit author is a GitHub user with access to the project. This is an anti-spam/abuse measure. Commits from unverified authors (no matching GitHub account) are rejected — no build, no deployment, 404.

This does **not** happen on Vercel **Pro/Enterprise** plans (which skip author verification), but Hobby is what this project uses.

---

## The Formula — Setting Up Git Correctly

### At clone time (EVERY time, EVERY AI)

After cloning the repo, immediately configure the commit author to the human's verified GitHub identity:

```bash
git clone https://RKW-Kim:<PAT>@github.com/RKW-Kim/smile-live-kit.git
cd smile-live-kit
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```

This sets the author **for this repo only** (not global), so it doesn't clobber the sandbox's global git config. Every commit made in this repo will now be authored by `RKW-Kim <rkw.kim22@gmail.com>` → Vercel recognizes the account → previews build.

### Verify before committing

```bash
git config user.name    # must print: RKW-Kim
git config user.email   # must print: rkw.kim22@gmail.com
```

### If you already committed with the wrong author

If a commit snuck through with a bad author, fix it before pushing (or force-push if already pushed — `feat/*` branches are not protected, so force-push is allowed):

```bash
# Fix the last commit's author
git commit --amend --author="RKW-Kim <rkw.kim22@gmail.com>" --no-edit

# Fix multiple commits since main (rebase + amend each, or squash)
git reset --soft origin/main
git commit -m "..."   # authored by current git config (set it first!)
```

### Force-pushing to `feat/*` branches

`main` is protected (no force-push). But `feat/*`, `fix/*`, `docs/*` branches are **not** protected — force-push is allowed. This lets you rewrite history (fix authors, squash, rebase) on a feature branch without trouble. After force-push, the PR auto-updates.

---

## The Preview URL — Do NOT Guess It. Read It From The PR.

The preview URL format is:

```
https://<vercel-project-name>-git-<vercel-deployment-hash>-<vercel-team-slug>.vercel.app
```

For this project (assuming the recommended project name `smile-live-kit`):
- `<vercel-project-name>` = **`smile-live-kit`** (NOT the repo name — Vercel uses the project name you chose at import. If the human named it differently at import, use that name.)
- `<vercel-deployment-hash>` = a **Vercel-generated** 6-7 char hash (e.g. `b2ccb1`). This is **NOT the git commit SHA** — it's Vercel's internal deployment ID. **You cannot guess it.**
- `<vercel-team-slug>` = the Vercel team slug (auto-generated at signup — **IMMUTABLE**, even if the username changes).

Example real preview URL:
```
https://smile-live-kit-git-b2ccb1-rkwkim22.vercel.app
```

> ⚠️ **Never assume the URL — always read it from the PR.** The `vercel[bot]` account posts a comment on every PR with the deployment details. Parse that comment to get the real URL. See "How to get the real preview URL" below.

### How to get the real preview URL

**Method A — from the Vercel bot's PR comment (programmatic):**

The `vercel[bot]` account posts a comment on every PR with the deployment details. The comment body starts with `[vc]:` and contains a base64-encoded JSON payload with the `previewUrl`:

```bash
TOKEN="<your fine-grained PAT>"
PR=7  # the PR number
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/RKW-Kim/smile-live-kit/issues/$PR/comments" > /tmp/comments.json
python3 << 'PY'
import json, base64, re
for c in json.load(open('/tmp/comments.json')):
    body = c['body']
    if '[vc]:' in body:
        b64 = body.split('=:')[1] if ':=' in body else body.split(' ',1)[1]
        decoded = base64.b64decode(b64 + '===').decode('utf-8', errors='replace')
        m = re.search(r'"previewUrl":"([^"]+)"', decoded)
        if m: print("PREVIEW_URL:", m.group(1))
        m2 = re.search(r'"nextCommitStatus":"([^"]+)"', decoded)
        if m2: print("STATUS:", m2.group(1))
PY
```

**Method B — from the GitHub combined status (build success + inspector link):**

```bash
SHA=$(git rev-parse HEAD)
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/RKW-Kim/smile-live-kit/commits/$SHA/status" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('overall:', d['state']); [print(' ', s['context'], '->', s['state'], s.get('target_url','')) for s in d.get('statuses',[])]"
```
- `overall: success` + `Vercel -> success` = the build worked. The `target_url` is the Vercel dashboard inspector (not the live URL — use Method A for the live URL).

**Method C — the human just clicks the link on the PR:**

On GitHub, PR #7 → scroll to the `vercel[bot]` comment → the preview URL is a clickable link. The human (logged into Vercel) clicks it and sees the app.

### Vercel Authentication (login required for previews)

Vercel Hobby projects enable **"Vercel Authentication"** on preview deployments by default. This means:
- The **human** (logged into their Vercel account) sees the app. ✅
- Anyone **not** logged into the Vercel team sees a **Vercel login page**. (An AI running `agent-browser` will see the login page, NOT the app.)
- `curl` returns `200` but the body is the login page HTML, not the app.

**To disable (if you want public previews):** Vercel dashboard → your project → **Settings → Deployment Protection** → turn OFF "Vercel Authentication" for Preview deployments. (Production is unaffected.)

**For AI verification:** because of Vercel Authentication, the AI cannot `agent-browser` the LIVE preview. Instead, the AI verifies the **build succeeded** (GitHub API: `Vercel` status = `success`) and verifies the **app renders** by running the dev server locally + `agent-browser` on `localhost:3000`. The human does the final visual check on the live Vercel preview.

**Production** (only updates on merge to `main`): `https://smile-live-kit.vercel.app/` (NOT auth-protected).

---

## Troubleshooting

### `404: NOT_FOUND / DEPLOYMENT_NOT_FOUND`

| Cause | Fix |
|-------|-----|
| Commit authored by unverified email (most common) | Re-author as `RKW-Kim <rkw.kim22@gmail.com>`, force-push. |
| Wrong URL format (guessed the URL instead of reading it from the PR comment) | Read the URL from the Vercel bot's PR comment (see Method A above). |
| Build still in progress (first ~90s after push) | Wait, then re-check the GitHub status. |
| Branch was never pushed to origin | `git push -u origin <branch>`. |
| Vercel project not connected to the repo | Human must import the repo at [vercel.com/new](https://vercel.com/new) (one-time setup). |

> **Note:** a `200` from curl does NOT mean the app rendered — Vercel Authentication returns a `200` login page. Always check the **build status** via the GitHub API (`Vercel` status = `success`) AND run the dev server locally to confirm the app renders.

### `Vercel — GitHub couldn't verify an account for the commit`

This is **always** the commit-author-email problem. Fix:
```bash
git config user.email "rkw.kim22@gmail.com"
git commit --amend --author="RKW-Kim <rkw.kim22@gmail.com>" --no-edit
git push --force-with-lease   # feat/* branches allow force-push
```

### Vercel build fails (red ❌, but deployment exists)

This is a real code error — the build crashed. Check the Vercel build logs:
- Go to the PR on GitHub → click the `Vercel` check → "Details" → read the build log.
- Common causes: missing env vars, a `next build` error that `ignoreBuildErrors` doesn't cover (e.g. Prisma client not generated), a TypeScript error that CI's `bunx tsc --noEmit` would have caught (always run `bash scripts/verify.sh` before pushing).

### CI shows `startup_failure` (GitHub Actions)

The repo is **private**. GitHub Actions on private repos requires GitHub Pro ($4/mo). On the free plan, private repos have 0 Actions minutes → CI shows `startup_failure`. **This is expected and fine** — Vercel's build is the real gate. If you want CI to actually run, make the repo public OR upgrade to GitHub Pro.

---

## The Commit-Author-Email Quick Check (add to every session start)

Before writing any code, run this one-liner to confirm the author is set correctly:

```bash
cd smile-live-kit && [ "$(git config user.email)" = "rkw.kim22@gmail.com" ] && echo "✓ author OK" || echo "✗ RUN: git config user.name 'RKW-Kim' && git config user.email 'rkw.kim22@gmail.com'"
```

If it prints `✗`, run the config command immediately. Every commit you make before fixing this will produce a 404 preview.

The `scripts/agent-bootstrap.sh` script also sets the git identity automatically — run it in a bare sandbox.

---

## Summary — The Preview Checklist

Before telling the human "the preview is ready":

- [ ] `git config user.email` returns `rkw.kim22@gmail.com` (set at clone time).
- [ ] Commit pushed to `origin/feat/<branch>`.
- [ ] PR is open on GitHub.
- [ ] GitHub combined status shows `Vercel -> success` (wait ~90s after push; poll the API).
- [ ] GitHub combined status does NOT show "GitHub couldn't verify an account for the commit" (that = bad author email).
- [ ] Dev server runs locally: `bun run dev` → `GET / 200`, `agent-browser` confirms the app renders (this substitutes for the Vercel preview, which is auth-protected).
- [ ] Extract the real preview URL from the Vercel bot's PR comment (Method A above) — do NOT guess it.
- [ ] Give the human the preview URL from the PR comment (they're logged into Vercel and can view it).

Only then tell the human the preview is ready. If any step fails, fix it first — don't hand over a 404 or a login page.

---

## Preview Deployment Cleanup — Do They Persist After Merge?

**Short answer:** Yes, Vercel does NOT auto-delete preview deployments when a branch is deleted or a PR merges (on the Hobby plan). They persist forever — **but they don't waste compute resources when idle.**

### Why it's NOT a resource problem

Vercel preview deployments are **serverless/static** — they're static files (HTML/CSS/JS) served via CDN + serverless functions that only run when invoked. When nobody is visiting a preview URL, it consumes:
- **Zero CPU**
- **Zero RAM**
- **Zero ongoing compute**

So "a million previews running" is a misconception — they're frozen files on a CDN. You won't get a surprise bill from accumulated previews. The idle cost is effectively zero.

### What DOES accumulate

| Resource | Impact |
|----------|--------|
| The deployment (static files) | Persists in Vercel's storage forever |
| The preview URL | Keeps working forever (until manually deleted) |
| Vercel dashboard | Clutters with many old deployments |
| Build minutes | Already spent at push time (Hobby: 6000 min/mo) — no ongoing cost |
| Bandwidth | Only consumed if someone visits the old URL (Hobby: 100GB/mo) |

### Cleanup options

**Option 1 — Manual via Vercel dashboard (simplest):**
1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. Filter by "Preview".
3. Select old ones → **Delete**.

**Option 2 — Vercel CLI (faster for bulk):**
```bash
npm i -g vercel
vercel login
vercel rm <deployment-url>   # repeat for each
```

**Option 3 — Automated cleanup (GitHub Actions cron + Vercel API):**
A scheduled job that calls `DELETE /v13/deployments/{id}` for previews older than N days. Requires a Vercel token (vercel.com → Settings → Tokens). Write it when the dashboard gets cluttered.

**Option 4 — Upgrade to Pro ($20/mo):**
Pro has a "Deployment Expiration" setting that auto-deletes deployments older than X days. Worth it if you also want: more build minutes, team features, or automatic cleanup.

### Recommendation for this project

On Hobby plan: **don't worry about it until the dashboard gets cluttered** (50+ old previews). The accumulated deployments are harmless (static files, zero idle compute). Do a manual cleanup sweep when it gets visually noisy. The resource to actually watch is **build minutes** (6000/mo on Hobby) — we're nowhere near that limit.

---

*This document exists because a preview URL silently 404'd for an entire session due to a wrong commit-author email. Never again.*
