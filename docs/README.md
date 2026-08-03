# Smile Live Kit — Documentation Index

All Smile Live Kit documentation. **Start with [`handoff/`](handoff/).**

## Structure

```
docs/
├── handoff/             # 17-file handoff series (00-16) + AI_BRIEFING + CURRENT_STATE — read first
├── brand/               # The W21 brand bible (IDENTITY_SYSTEM.md)
├── deployment/          # Vercel preview guide, safeguards, GitHub token security
├── development/         # Branching strategy, PR review process, day-to-day workflow guide
├── verticals/           # W21 Trading vertical (the launch channel) — strategic, content, technical, launch
│   └── w21-trading/
├── adr/                 # Architecture Decision Records
├── research/            # Market + technical research (RESEARCH-*.md) — cite before building features
└── RESEARCH_INDEX.md    # Catalog of all research + how it informs features
```

## Reading Order

### For a new AI/chat (mandatory):
1. [`handoff/00-MASTER-HANDOFF-INDEX.md`](handoff/00-MASTER-HANDOFF-INDEX.md) — entry point + the 3 sacred rules summary
2. [`handoff/CURRENT_STATE.md`](handoff/CURRENT_STATE.md) — what's done, what's next
3. [`handoff/AI_BRIEFING.md`](handoff/AI_BRIEFING.md) — single-source-of-truth briefing
4. [`handoff/15-CONTINUATION_PROMPT.md`](handoff/15-CONTINUATION_PROMPT.md) — copy-paste prompt for the next AI
5. [`handoff/01-PROJECT_VISION.md`](handoff/01-PROJECT_VISION.md) — what Smile Live Kit IS
6. [`handoff/02-ARCHITECTURE.md`](handoff/02-ARCHITECTURE.md) — Next.js routes as scenes/overlays
7. [`handoff/12-KNOWN_ISSUES.md`](handoff/12-KNOWN_ISSUES.md) — avoid solved traps
8. [`brand/IDENTITY_SYSTEM.md`](brand/IDENTITY_SYSTEM.md) — the W21 brand bible (read end-to-end before touching anything in `src/components/w21/`)
9. [`RESEARCH_INDEX.md`](RESEARCH_INDEX.md) — before building a feature, check if research exists

### For a human developer:
1. [`../AGENTS.md`](../AGENTS.md) — the handoff contract + the 3 sacred rules
2. [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — stack, code standards, PR process
3. [`development/BRANCHING.md`](development/BRANCHING.md) — branch model
4. [`development/WORKFLOW_GUIDE.md`](development/WORKFLOW_GUIDE.md) — the day-to-day dev loop

### For the W21 Trading launch channel:
1. [`verticals/w21-trading/README.md`](verticals/w21-trading/README.md) — overview
2. [`verticals/w21-trading/STRATEGIC_BRIEF.md`](verticals/w21-trading/STRATEGIC_BRIEF.md) — executive vision
3. [`verticals/w21-trading/CONTENT_STRATEGY.md`](verticals/w21-trading/CONTENT_STRATEGY.md) — 24-hr grid + curriculum ladder
4. [`verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md`](verticals/w21-trading/TECHNICAL_INFRASTRUCTURE.md) — VPS+FFmpeg+hybrid streaming
5. [`verticals/w21-trading/LAUNCH_ROADMAP.md`](verticals/w21-trading/LAUNCH_ROADMAP.md) — Phase 0–4

### For deployment / preview issues:
1. [`deployment/VERCEL_PREVIEW_GUIDE.md`](deployment/VERCEL_PREVIEW_GUIDE.md) — the commit-author-email rule + how to read the real preview URL
2. [`deployment/SAFEGUARDS.md`](deployment/SAFEGUARDS.md) — branch protection, PR approval, the full safeguard system

### For architecture decisions:
- [`adr/`](adr/) — each ADR documents a settled architectural choice + rejected alternatives. Read before re-deciding.

### For feature research:
- Check [`RESEARCH_INDEX.md`](RESEARCH_INDEX.md) first — every Smile Live Kit feature should trace to research or to OBS parity.
- The W21 Trading vertical research is fully synthesized in [`verticals/w21-trading/`](verticals/w21-trading/) — six research sessions covering market, brand, content, technical, hardware, and operational dimensions.

---

## The Canonical Worklog

The live worklog is at [`/worklog.md`](../worklog.md) (repo root). It is **non-rollbackable** — every AI session appends an entry before AND after work. Read the last 3-5 entries to know what the previous AI did. The handoff doc [`handoff/14-WORKLOG_FULL.md`](handoff/14-WORKLOG_FULL.md) points back to the canonical file (it does not duplicate the content — there is one source of truth).

---

*This docs index is the project's knowledge map. Keep it updated as the project grows.*
