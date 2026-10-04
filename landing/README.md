# CookPal landing

Static landing page and self-hosting guide for cookpal.io (Astro, Tailwind v4). English is served at `/`, German at `/de/`. The app lives at `/app/`, outside this project.

```
npm ci
npm run dev      # dev server, for working on the page itself
npm run build    # copies the app icon, builds to dist/
npm run check    # astro check
npm test         # checks the built pages in dist/
```

`npm run landing` in the repo root installs the landing's dependencies and starts the dev server on http://localhost:4321; `npm run dev` here only starts it. `docker build .` in the repo root builds the page into the frontend image, including `npm run check` and `npm test`. The Expo dev server (`npm run web`) serves only the app, at http://localhost:8081/app/.

Copy is in `src/content.ts` (home) and `src/selfHosting.ts` (guide). All links are in `src/site.ts`.

Screenshots are `src/assets/screenshots/<lang>/<name>.webp` (names in `src/screenshots.ts`) and the Open Graph images are `public/og-en.png` and `public/og-de.png` (1200 x 630). Both are written by the screenshot tool in `opencookbook/screenshots`. `public/favicon.png` is copied from `../assets/icon.png` by `scripts/sync-assets.mjs` and not checked in.
