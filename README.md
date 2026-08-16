# VibeTrunk — home

The landing page for [vibetrunk.com](https://vibetrunk.com): one static page that
lists every VibeTrunk tool as it ships.

Each tool lives in its own repo and its own Vercel project on a subdomain
(`cogitster.vibetrunk.com`, and so on). This repo owns the root domain only, and
knows nothing about the tools beyond their name, blurb, and URL.

## Stack

Astro 7, static output, no client-side JavaScript. The build emits plain HTML
and one stylesheet per page.

## Adding a tool

Edit [`src/data/tools.ts`](src/data/tools.ts) — it is the only file that
changes when something ships:

```ts
export const tools: Tool[] = [
  {
    name: 'Cogitster',
    blurb: 'Place famous quotes on a timeline before anyone else does.',
    url: 'https://cogitster.vibetrunk.com',
    status: 'live',
  },
];
```

`status: 'live'` requires a `url`; the type will not compile without one. Live
tools sort ahead of `coming-soon` ones automatically. Push to `main` and Vercel
rebuilds.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built output
npm run check    # type-check .astro and .ts files
```

Requires Node >= 22.12.

## Deployment

Live at [vibetrunk.com](https://vibetrunk.com), on Vercel's Hobby plan under
the `VibeTrunk` team, mapped to the apex domain (`www` redirects to it). Vercel
auto-detects Astro (build `astro build`, output `dist/`);
[`vercel.json`](vercel.json) only adds response headers. DNS is hosted at
Porkbun — see [`docs/decisions.md`](docs/decisions.md#deployment) for the
record values and a note on the Vercel web import wizard misbehaving during
setup.

## Known gaps

- The CSP sends `script-src 'none'`. Enabling Vercel Web Analytics or Speed
  Insights later means loosening that line.
