// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Absolute base for canonical URLs and social metadata. Must match the
  // production domain this repo is mapped to in Vercel.
  site: 'https://vibetrunk.com',

  build: {
    // Emit a real stylesheet instead of inlining small ones, so the CSP in
    // vercel.json can drop 'unsafe-inline' from style-src entirely.
    inlineStylesheets: 'never',
  },
});
