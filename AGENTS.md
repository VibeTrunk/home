# AGENTS.md

This file provides guidance to ChatGPT and Codex when working with code in this repository.

## Canonical project guidance

Before doing repository work, read [`CLAUDE.md`](CLAUDE.md) in full and follow it as project guidance. It is the canonical description of the project, its status, and the wider VibeTrunk ecosystem.

Do not duplicate that guidance here: keeping a single canonical project description prevents Claude and Codex instructions from drifting apart. If the project changes, update `CLAUDE.md`; this file will continue to direct Codex to it.

## Codex-specific safety and permissions

- Repository-local Codex hooks and command rules live under `.codex/` and require the repository to be trusted. Standard VibeTrunk scaffold — see global `~/.codex/AGENTS.md` for the agent safety policy and push/deployment discipline these hooks and rules enforce.
- Normal `git push`, `npm run *`, and `gh ...` commands are allowed by the repository command rules.
- Never run a `vercel deploy`/`vercel --prod` unless explicitly asked.
- This same pattern (`.claude/`, `.codex/`, `AGENTS.md`, gitleaks CI) is the template for every VibeTrunk-org repo — copy it into new tool repos and adapt only the stack-specific command lists.
