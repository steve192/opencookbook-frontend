// Every URL of the site and every external link lives here.
import { TOOLS, type ToolId } from './tools.ts';
import type { Lang } from './content';

export const SITE_URL = 'https://cookpal.io';

export const links = {
  app: '/app/',
  signup: '/app/signup',
  imprint: '/app/legal/imprint',
  privacy: '/app/legal/privacy',
  terms: '/app/legal/terms',
  github: 'https://github.com/steve192/opencookbook',
  githubCompose: 'https://github.com/steve192/opencookbook/tree/main/compose',
  envReference: 'https://raw.githubusercontent.com/steve192/opencookbook/main/compose/.env',
  apk: 'https://github.com/steve192/opencookbook-frontend/releases/latest',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.sterul.opencookbook',
} as const;

/** A kitchen tool's screen in the app. */
export const appToolLink = (slug: string) => `${links.app}tools/${slug}`;

// Opens external links in a new tab.
export const linkTarget = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export type PageKey = 'home' | 'selfHosting' | ToolId;
type PagePair = Record<Lang, string>;

// The localized page pairs; the sitemap and the build test use the same list.
export const pagePaths: Record<PageKey, PagePair> = {
  home: { en: '/', de: '/de/' },
  selfHosting: { en: '/self-hosting/', de: '/de/selbst-hosten/' },
  ...(Object.fromEntries(
    TOOLS.map((tool) => [tool.id, { en: `/tools/${tool.slug}/`, de: `/de/kuechenhelfer/${tool.slugDe}/` }]),
  ) as Record<ToolId, PagePair>),
};

/** The language versions of a page as absolute URLs; English is the default. */
export const alternates = (page: PageKey) => {
  const { en, de } = pagePaths[page];
  return [
    { hreflang: 'en', href: new URL(en, SITE_URL).href },
    { hreflang: 'de', href: new URL(de, SITE_URL).href },
    { hreflang: 'x-default', href: new URL(en, SITE_URL).href },
  ];
};
