# VibeTrunk — Project Context

## What this is
VibeTrunk is a hub for hosting several independent, vibe-coded tools and games. This repo is the **landing page** for that hub: a single page listing and linking every tool as it ships.

## Status so far
- **Domain:** vibetrunk.com, registered on Porkbun. No DNS records pointed anywhere yet.
- **GitHub org:** `VibeTrunk`, created, empty except for this repo.
- **Vercel:** connected to the VibeTrunk GitHub org on the free Hobby plan (non-commercial use only).
- **Supabase:** not created yet — the shared backend project comes later, once the first tool needs it.
- **This repo:** not yet built. Starting from scratch.

## This repo's job
Build a simple, single-page site for the root domain `vibetrunk.com` (not a subdomain):
- Short intro: what VibeTrunk is, in a couple of sentences
- A list/grid of tools — each with a name, one-line blurb, and link — that grows as tools ship
- Nothing has shipped yet, so start with an empty state or a "first tool coming soon" placeholder
- Keep it lightweight: plain HTML/CSS or a minimal static framework (Astro, or a bare Next.js static export) — no backend, no database, no auth needed for this repo
- Deploy target: Vercel, mapped to the root `vibetrunk.com` domain (this repo, once pushed, gets imported into Vercel as its own project)

## Ecosystem — for context, not this repo's job
Every future tool gets its **own repo** in the VibeTrunk GitHub org, deployed as its **own Vercel project**, on a subdomain of vibetrunk.com (e.g. `cogitster.vibetrunk.com`). All tools will share **one Supabase project** (not one per tool) with a separate Postgres schema per tool, to stay under free-tier project limits and keep one bill.

First tool: **Cogitster** — a philosophy timeline game where players place quotes, thinkers, books, concepts, and events in the correct order. It includes solo play against AI and sequential-turn multiplayer, and uses Supabase Realtime for live sync. It shipped its own repo (`VibeTrunk/cogitster`) on 2026-08-16.

New tools no longer get scaffolded by cloning a template repo — that plan was superseded by the `vibetrunk-new-tool` Claude Code skill (`~/.claude/skills/vibetrunk-new-tool/`), which asks the setup questions (backend or not, framework, public/private) and adapts the scaffolding instead of leaving that to hand-editing a clone. See `docs/decisions.md`.

## Working style
This is partly a deliberate learning project in production-grade practices (architecture, security, maintainability), not just a quick hack — favor clear structure and documenting decisions in markdown as you go.

## Agent safety

Standard VibeTrunk scaffold (see global CLAUDE.md's agent safety policy) —
PreToolUse hooks block destructive commands and young (<14-day) npm
packages; see AGENTS.md and .claude/settings.json /
.codex/rules/project.rules for exact allow/deny lists. This pattern
(.claude/, .codex/, AGENTS.md, gitleaks CI) is the template for every
VibeTrunk-org repo — new repos should copy it and adapt only the
stack-specific command lists.

## Branch protection
Branch protection on `main` was enabled 2026-08-23: PRs required before
merge, direct pushes blocked (including for admins), squash-only merges,
branches auto-delete on merge. No required review count or status checks
(solo project). See the global `~/.claude/CLAUDE.md` "Branch workflow"
section for the actual conventions (branch naming, PR flow, who merges).
