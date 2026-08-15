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
Every future tool gets its **own repo** in the VibeTrunk GitHub org, deployed as its **own Vercel project**, on a subdomain of vibetrunk.com (e.g. `hitster.vibetrunk.com`). All tools will share **one Supabase project** (not one per tool) with a separate Postgres schema per tool, to stay under free-tier project limits and keep one bill.

First planned tool: a **"Hitster for philosophy"** — a multiplayer game where players place famous philosophy quotes on a timeline in the correct order, modeled on the Dutch game Hitster (which does this with pop songs). It'll use Supabase Realtime for live sync between players. Once it's built, its boilerplate (Vercel config, Supabase client setup, env var pattern) gets extracted into a reusable template repo for future tools.

## Working style
This is partly a deliberate learning project in production-grade practices (architecture, security, maintainability), not just a quick hack — favor clear structure and documenting decisions in markdown as you go.
