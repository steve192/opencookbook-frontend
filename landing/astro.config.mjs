import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL, alternates, pagePaths } from './src/site.ts';

const sitemapLinks = new Map(
  Object.keys(pagePaths).flatMap((page) => {
    const links = alternates(page).map(({ hreflang, href }) => ({ lang: hreflang, url: href }));
    return Object.values(pagePaths[page]).map((path) => [new URL(path, SITE_URL).href, links]);
  }),
);

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404.html'),
      serialize: (item) => ({ ...item, links: sitemapLinks.get(item.url) }),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
