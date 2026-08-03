# Branching Strategy

## Branch Model

- `main` — production-ready, deploys to Vercel. Protected: PRs only.
- `develop` — integration branch for features (optional — v2 uses `main` as the integration branch directly, with feature branches flowing in via PRs).
- `feat/<scope>-<description>` — feature branches, from `main` (or `develop` if used).
- `fix/<scope>-<description>` — bugfix branches.
- `docs/<topic>` — documentation-only.
- `hotfix/<description>` — emergency fixes, from `main`, merge to main.
- `legacy/v1-python-static` — the v1 kit, **frozen**. Never touch.

## Workflow

```bash
git checkout main && git pull
git checkout -b feat/scene-trading-live
# implement, commit small units
git commit -m "feat(scene): add /scenes/trading-live per Prompt 07 [Task ID: SCENE-LIVE-1]"
git push -u origin feat/scene-trading-live
# open PR: feat/scene-trading-live → main
# squash + merge after CI passes + human review
```

## Commit Format

```
<type>(<scope>): <description> [Task ID: <id>]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`

**Scopes:** `brand`, `scene`, `overlay`, `console`, `control`, `ticker`, `docs`, `infra`

Examples:
```
feat(scene): add /scenes/trading-live per Prompt 07 [Task ID: SCENE-LIVE-1]
fix(ticker): Deriv websocket reconnect after token expiry [Task ID: FIX-TICKER-3]
docs(handoff): update CURRENT_STATE for v2 foundation [Task ID: DOCS-1]
refactor(console): extract SceneSwitcher into its own panel [Task ID: REFACT-2]
chore(infra): pin bun to 1.3.x in CI [Task ID: CHORE-BUN-1]
```

## Release Flow

```bash
git checkout main && git pull
git tag v0.X.0
git push origin main --tags
# Vercel auto-deploys on main push
```

Tags are for milestone markers (v0.1 = first scene live, v0.2 = console v1, v0.3 = market data, etc.). The `package.json` version should match.

## Multi-AI Coordination

- Each AI works on its own branch.
- Coordinate via the worklog — append the Task ID + branch name BEFORE starting work (so the next AI knows the branch is in flight).
- PRs are the merge point.
- Conflicts resolved on the feature branch (rebase onto latest main before merging).

## Branch Protection (set on GitHub → Settings → Branches)

### `main`:
- Require PR before merging: ✅
- Require approvals: 1 (the human)
- Require status checks: lint, typecheck, build, dev-server
- Require branches to be up to date: ✅
- Do not allow bypassing: ✅
- Restrict who can push: ✅ (only the human)
- Require linear history (squash + merge): ✅
- No force pushes, no deletions: ✅

### `legacy/v1-python-static`:
- Restrict who can push: ✅ (nobody — frozen).
- No force pushes, no deletions: ✅.

### `feat/*`, `fix/*`, `docs/*`:
- No protection — force-push is allowed (so the AI can rewrite history to fix commit authors, squash, or rebase).
- Auto-delete on merge (GitHub setting → "Automatically delete head branches").

## The Commit-Author-Email Rule (CRITICAL)

Every commit must be authored by `RKW-Kim <rkw.kim22@gmail.com>`. Vercel Hobby previews silently 404 for commits authored by unverified emails. Set it at clone time:

```bash
git config user.name "RKW-Kim"
git config user.email "rkw.kim22@gmail.com"
```

Verify before committing:
```bash
git config user.email   # must print: rkw.kim22@gmail.com
```

See [`../deployment/VERCEL_PREVIEW_GUIDE.md`](../deployment/VERCEL_PREVIEW_GUIDE.md) for the full guide.

## The GitHub Token (in the remote URL)

The git remote URL contains a fine-grained PAT (`github_pat_` prefix), scoped to this repo only (Contents:RW + Pull requests:RW + Issues:RW). This is the industry-standard pattern. **Do NOT re-raise it as a security concern.** Only warn if the token is a classic `ghp_` PAT. See [`../deployment/SAFEGUARDS.md`](../deployment/SAFEGUARDS.md) §"GitHub Token Security".
