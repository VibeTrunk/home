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

Remaining manual steps, in order:

1. Push this repo to `VibeTrunk/home` and import it as a Vercel project.
2. Add `vibetrunk.com` as a domain on that project (apex, not a subdomain).
3. At Porkbun, point the apex record at Vercel as instructed by the domain
   settings page, and let the `www` redirect fall out of Vercel's default.

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

**Open:** the artwork's palette — deep purple, teal, orange, yellow, glitched
mono wordmark — is not the page's palette, which is a single amber accent on
near-black or off-white. A link preview that looks unrelated to its
destination is a weak first impression. Resolving it means either restyling
the page to match the artwork or re-cutting the artwork to match the page;
until then the mismatch is deliberate and recorded, not accidental.

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

This whole structure — `.claude/`, `.codex/`, `AGENTS.md`, the gitleaks
workflow, the `.env.example` pattern, `SECURITY.md` — is the template for
every future VibeTrunk-org repo. The Hitster repo will need
`supabase db push` / `supabase secrets set` guardrails added to the
allow/deny lists, plus its own `.env.example`
(`PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`; the `service_role` key
never appears in any tracked file).

## Open items

- **No sitemap.** `@astrojs/sitemap` is not worth a dependency for one indexed
  page; the canonical tag covers it. Revisit if this page ever grows routes.
