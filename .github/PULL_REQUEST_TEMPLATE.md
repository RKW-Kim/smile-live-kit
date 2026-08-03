## Summary
<!-- One paragraph: what does this PR do and why? -->

## Task ID
<!-- e.g., [Task ID: SCENE-LIVE-1] — must match the worklog entry -->

---

## 🔖 Review Type (pick ONE — this tells the human whether they need to look)

- [ ] **`needs-human-review`** — there ARE visible changes (a new scene, a recolored overlay, a console layout change, a ticker redesign, an animation). The human must review the Vercel preview. Fill in the "👀 What to check" section below. **Do NOT merge until the human says "merge it".**
- [ ] **`ai-verified`** — NO visible changes (backend, types, lint, docs, config, refactors with no UI effect). You already verified lint + tsc + dev + scene-route 200s. **Self-merge after verification.** Tell the human "merged (ai-verified, nothing for you to check)".

> **How to decide:** If a real human opening the Vercel preview would see ANY difference (a scene's layout, a color, a text label, an interaction, an animation, a new/removed element), it's `needs-human-review`. If the only differences are in types, error counts, internal logic, config, or docs, it's `ai-verified`. When unsure, choose `needs-human-review` — it's safer.

---

## 👀 What to check in the preview
<!-- For `needs-human-review` PRs: list SPECIFIC things the human should do/look at. Be concrete. -->
<!-- For `ai-verified` PRs: write "Nothing visible — this is [backend/types/docs/config] only, AI-verified." -->

-
-
-

**Preview URL:** <!-- For needs-human-review: the real URL from the vercel[bot] PR comment (NOT guessed — see docs/deployment/VERCEL_PREVIEW_GUIDE.md). For ai-verified: "N/A — no visible change" -->

---

## Type of Change
- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] docs — documentation
- [ ] refactor — no behavior change
- [ ] chore — deps/config/build
- [ ] test — tests

## Scope
<!-- Pick the scope from the commit format (brand | scene | overlay | console | control | ticker | docs | infra) -->
-

## OBS Parity (if feature)
<!-- Which OBS feature or community-plugin pattern does this match? See docs/handoff/09-FEATURES.md -->

## AI Verification (filled by the AI before opening the PR)
- [ ] `bun run lint` passes (0 errors)
- [ ] `bunx tsc --noEmit` passes (0 errors — Smile Live Kit has no "sacred error" carve-out)
- [ ] `bun run dev` returns 200 on `/` (the control console)
- [ ] Every scene/overlay route touched by this PR returns 200 (e.g., `curl -sf http://localhost:3000/scenes/<route>`)
- [ ] `agent-browser` verified (for visible changes: title + 0 page errors + 1 interaction; for non-UI: dev 200 + build status)
- [ ] Vercel build status = `success` (check via GitHub API — see `docs/deployment/VERCEL_PREVIEW_GUIDE.md`)
- [ ] Worklog entry appended to `worklog.md`
- [ ] `docs/handoff/CURRENT_STATE.md` updated (if state changed)
- [ ] W21 brand rules honored (the mark is untouched, the channel color is sourced from `channels.ts`, numbers are `tabular-nums`, the structural grid is present, no indigo/blue decorative accents)

## Breaking Changes
- [ ] None
- [ ] Yes (describe migration below)
