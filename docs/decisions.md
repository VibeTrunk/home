# Decisions — home

Why this repo looks the way it does. Newest entries at the bottom.

## Framework: Astro, static output

Considered plain HTML/CSS with no build step, and plain HTML rendering a
`tools.json` client-side.

Chose Astro because the page's one recurring edit — adding a tool — should
touch data, not markup. Astro gives a typed data file and a component without
shipping any JavaScript: the built output is HTML and CSS, exactly what a
zero-build approach would produce by hand.

The cost is a `node_modules` and a dependency to keep current. Accepted, because
the alternative that also separates data from markup (client-rendered
`tools.json`) makes the tool list invisible without JavaScript — a bad trade for
a page whose entire job is that list.

## Tool data: a discriminated union

`src/data/tools.ts` models a tool as:

```ts
type Tool =
  | (ToolBase & { status: 'live'; url: string })
  | (ToolBase & { status: 'coming-soon'; url?: undefined });
```

rather than `{ status: ToolStatus; url?: string }`. The union makes "a live tool
with no link" fail to compile instead of rendering a dead card. The likely
failure mode for this repo is flipping a status to `live` and forgetting the
URL, so it is worth encoding.

Sorting lives next to the data (`sortedTools`) so pages never re-implement it.

## Styling: tokens, two schemes, no framework

Colors, fonts, radius, and transition duration are custom properties on
`:root`, redefined under `prefers-color-scheme: dark`. Components only ever
reference token names, so a palette change is one file.

Light is the base declaration and dark is the override — meaning a browser that
reports no preference gets the light palette. `color-scheme: light dark` lets
form controls and scrollbars follow along.

No CSS framework: the page is a header, a grid, and a footer. Astro's scoped
`<style>` blocks keep component CSS next to component markup.

## No client-side JavaScript

Nothing on the page needs it, including the theme — `prefers-color-scheme`
handles that in CSS. There is deliberately no theme toggle, since a toggle
needs JavaScript and `localStorage` to avoid flashing on load.

This is also what makes the strict CSP below possible.

## Security headers in `vercel.json`

The site loads no third-party anything, so the CSP can be strict rather than
nominal: `script-src 'none'`, `style-src 'self'`, `frame-ancestors 'none'`, no
`unsafe-inline` anywhere.

`build.inlineStylesheets: 'never'` in `astro.config.mjs` exists to support this.
Astro inlines small stylesheets by default, which would have forced
`style-src 'unsafe-inline'`. Trading one extra request for a CSP with no inline
escape hatch is the right side of that trade here.

Also set: HSTS with `preload`, `nosniff`, `strict-origin-when-cross-origin`
referrer policy, and a `Permissions-Policy` denying camera/mic/geolocation.

**If Vercel Web Analytics or Speed Insights is ever enabled, `script-src 'none'`
must be loosened** — the injected script will otherwise be blocked silently.

## Deployment

Vercel auto-detects Astro; no `framework`, `buildCommand`, or `outputDirectory`
is pinned in `vercel.json`. Only headers are configured there.

Live at `vibetrunk.com` (apex is the canonical/Production domain; `www`
307-redirects to it, matching the `site` value in `astro.config.mjs`).

The web import wizard at vercel.com/new got stuck in a permanently-disabled
Deploy button after the repo went private → public — no tooltip, no banner,
scope already correct (App installed on the org with all-repository access).
Root cause unconfirmed; worked around entirely via `vercel login` /
`vercel link` / `vercel deploy --prod` over the CLI, which hit no permission
issues at all. If a future tool repo's import hangs the same way, reach for
the CLI first rather than re-debugging the wizard.

Subdomains for individual tools are configured on *their own* Vercel projects,
not this one.

## Social preview image

`public/og.png` is a supplied 1200×630 asset, wired up in `Base.astro` as an
`image` prop so a future page can override it without touching the layout.

`og:image` and `twitter:image` are built with `new URL(image, Astro.site)`
because crawlers reject relative URLs — this is the second thing (after
`canonical`) that depends on `site` being set correctly in `astro.config.mjs`.
`twitter:card` is `summary_large_image` rather than `summary`, which is what
makes the 1200×630 render as a wide banner instead of a small square thumbnail.

Explicit `og:image:width` / `og:image:height` let a scraper lay out the card
before it has finished downloading the image.

**Resolved** by the redesign below: the page was restyled to match the
artwork rather than re-cutting the artwork to match the page.

## Agent safety scaffolding

Considered relying on prompt instructions alone, or a bare permissions
allow-list with no enforcement.

Chose defense-in-depth: an allow-list (`.claude/settings.json`,
`.codex/rules/project.rules`) for routine reversible commands, plus a
`PreToolUse` hook (`.claude/hooks/`, `.codex/hooks/`) that pattern-matches
and denies destructive commands regardless of what the model decides. Prompt
instructions can be argued around by content an agent reads (a malicious
file, a misleading commit message); a hook running outside the model's
context cannot.

The hook logic is duplicated between `.claude/` and `.codex/` rather than
shared, because the two tools' hook runners don't load each other's config.
`AGENTS.md` exists only to point Codex at `CLAUDE.md` as canonical project
context, so the two docs don't drift into disagreeing descriptions of the
same project.

`gitleaks` runs in CI (push + PR) as an independent second layer: the hook
blocks command *patterns*, not file *contents* — a secret typed directly
into a file via an editor, never passed through a shell command, would pass
the hook and needs a scanner that reads the diff instead.

The workflow runs the open-source gitleaks CLI directly via its official
`ghcr.io/gitleaks/gitleaks` container image, not the `gitleaks-action`
wrapper — first attempt used the wrapper and it failed the very first run
with "missing gitleaks license," because that wrapper now requires a paid
`GITLEAKS_LICENSE` for any org-owned repo, public or not. The underlying CLI
stays free regardless of org/private status; only Gitleaks Inc.'s
value-added Action wrapper is gated.

Verified the workflow actually catches a real secret, not just that it runs:
planted a fake token on a disposable branch/PR and watched it pass clean —
`gitleaks git` failed with "detected dubious ownership in repository" (the
checkout step and the gitleaks container run as different UIDs) but treated
that as a warning, not a fatal error, and reported "no leaks found" after
scanning 0 commits. A silent false pass is worse than no scanner at all,
since it looks like protection without providing any. Fixed by running
`git config --global --add safe.directory "$GITHUB_WORKSPACE"` before the
scan; re-verified with the same planted secret and confirmed a real failure
(`RuleID: generic-api-key`, exit code 1) before merging the fix.

**Sharp edge worth knowing:** `gitleaks git` scans every branch fetched by
`actions/checkout` (`fetch-depth: 0` pulls all of `refs/heads/*`), not just
the ref being built. While the disposable test branch above still existed
on the remote, it failed the *next* unrelated push to `main` too — a secret
sitting on any pushed branch, even an abandoned WIP one, breaks CI
everywhere until that branch is deleted. Delete branches promptly once
they're no longer needed, rather than leaving them stale on the remote.

This whole structure — `.claude/`, `.codex/`, `AGENTS.md`, the gitleaks
workflow, the `.env.example` pattern, `SECURITY.md` — is the template for
every future VibeTrunk-org repo.

## Cogitster split into its own repo

Cogitster had been developed nested in this repo's `cogitster/` working-tree
folder (untracked, `home`'s `tsconfig.json` excluded it from type-checking)
while its Supabase backend and Vercel project were brought up. Once it went
live at `cogitster.vibetrunk.com`, that arrangement stopped matching this
repo's own stated architecture ("every future tool gets its own repo... own
Vercel project"), so on 2026-08-16 the code was split out into
[`VibeTrunk/cogitster`](https://github.com/VibeTrunk/cogitster).

The template above was copied in and adapted: Supabase CLI's read-only/dry-run
subcommands (`supabase migration list`, `supabase db push --dry-run`,
`supabase functions deploy`) were added to the allow-list, but `supabase db
push` (for real), `supabase db reset`, and `supabase secrets set` were
deliberately left off it — they mutate the live schema or rotate live
credentials for the one Supabase project every VibeTrunk tool shares, so
each use should get a deliberate look rather than running unattended.

The existing live Vercel project (`cogitster`, already serving the domain)
was kept and reconnected to the new GitHub repo via `vercel git connect`
rather than creating a second project. The `gitleaks.yml` workflow could not
be pushed in the initial commit — the `gh` CLI's stored token only has
`gist, read:org, repo` scope, and GitHub rejects an OAuth App pushing
`.github/workflows/*` without the `workflow` scope. It needs
`gh auth refresh -s workflow` (interactive) or adding the file by hand on
github.com, then a follow-up push.

## Redesign: single dark world, sourced from the OG artwork

Restyled the page to match `public/og.png` instead of re-cutting the
artwork, closing the palette mismatch recorded above. Considered a muted
"daylight" variant of the same tokens so `prefers-color-scheme: light` still
had something to show; rejected it because the source artwork has no light
mode — it's a terminal in a trunk, and a terminal doesn't get a daylight
skin. This **supersedes** "Styling: tokens, two schemes" above: `global.css`
now defines one committed palette on bare `:root` with no
`prefers-color-scheme` branch, `color-scheme: dark`, and the browser chrome
follows via a single `theme-color` meta in `Base.astro`.

Token names changed shape, not just value, to match what they now represent:
`--bg`/`--surface`/`--fg`/`--fg-muted`/`--border`/`--accent` became
`--ink`/`--card`/`--paper`/`--mist`/`--line` plus three named accents
(`--cyan`, `--orange`, `--yellow` — the three tag colors in the artwork)
rather than one. `--radius` and `--transition` kept their names; only their
values changed, so nothing downstream had to know the palette shifted.

Typography stays system fonts — no new dependency, no font hosting, keeping
the zero-JS/no-CDN posture already established for the CSP. The artwork's
chunky offset-shadow wordmark is reproduced with a heavy system stack
(`--font-display`, an `Arial Black`/`Helvetica Neue` fallback chain) plus a
layered `text-shadow` (cyan then orange, offset a few px), not a custom
typeface. Used only on the wordmark and the 404 code, not page body text —
the effect is loud enough that it doesn't need to repeat to register.

Tool cards became the artwork's luggage-tag object: a colored flap, a
tilted rotation that straightens on hover, and decorative "stub" lines at
the bottom. Flap color now carries status: live tools cycle through
`cyan → orange → yellow` in ship order (`liveAccents` in `index.astro`), and
coming-soon tools always get a muted tab, so saturation itself signals
"shipped" without a separate legend. The rotation is computed from each
card's `index` prop rather than a CSS sibling selector on the parent's
`<li>`, because Astro scopes each component's `<style>` block separately —
a selector written in `ToolCard.astro` can't reach an element only
`index.astro` renders.

`public/favicon.svg` — an existing trunk-shaped mark — was recolored to the
new palette (cyan on ink) rather than redrawn; the shape already fit the
brand, only the old amber-on-near-black colors didn't.

No new dependencies, no new build step, no CSP change: still zero
client-side JavaScript, including the blinking terminal cursor (a CSS
`steps()` animation, covered by the existing
`prefers-reduced-motion` rule in `global.css`).

## Open items

- **No sitemap.** `@astrojs/sitemap` is not worth a dependency for one indexed
  page; the canonical tag covers it. Revisit if this page ever grows routes.
