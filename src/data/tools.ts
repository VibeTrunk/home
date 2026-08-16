/**
 * The trunk's contents.
 *
 * This is the only file you edit when a tool ships. Add an entry, push, and
 * Vercel rebuilds the landing page. Ordering here does not matter — the page
 * sorts live tools ahead of upcoming ones.
 */

export type ToolStatus = 'live' | 'coming-soon';

interface ToolBase {
  /** Display name, shown as the card heading. */
  name: string;
  /** One line, ideally under ~70 characters so cards stay the same height. */
  blurb: string;
}

/**
 * A discriminated union rather than an optional `url`: a tool marked `live`
 * cannot be committed without somewhere to point at, and the compiler is the
 * thing that enforces it.
 */
export type Tool =
  | (ToolBase & { status: 'live'; url: string })
  | (ToolBase & { status: 'coming-soon'; url?: undefined });

export const tools: Tool[] = [
  {
    name: 'Cogitster',
    blurb: 'Place philosophy on a timeline before anyone else does.',
    url: 'https://cogitster.vibetrunk.com',
    status: 'live',
  },
  {
    name: 'Kelderklasse Ultimate Team',
    blurb: 'Collectible football cards for Kelderklasse — showing up matters as much as scoring.',
    status: 'coming-soon',
  },
];

const statusOrder: Record<ToolStatus, number> = {
  live: 0,
  'coming-soon': 1,
};

/** Live tools first, then upcoming ones, each group in authored order. */
export const sortedTools: Tool[] = [...tools].sort(
  (a, b) => statusOrder[a.status] - statusOrder[b.status],
);
