// Every URL of the site and every external link lives here.
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

// Opens external links in a new tab.
export const linkTarget = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

// The localized page pairs; the sitemap and the build test use the same list.
export const pagePaths = {
  home: { en: '/', de: '/de/' },
  selfHosting: { en: '/self-hosting/', de: '/de/selbst-hosten/' },
} as const;

export type PageKey = keyof typeof pagePaths;

/** The language versions of a page as absolute URLs; English is the default. */
export const alternates = (page: PageKey) => {
  const { en, de } = pagePaths[page];
  return [
    { hreflang: 'en', href: new URL(en, SITE_URL).href },
    { hreflang: 'de', href: new URL(de, SITE_URL).href },
    { hreflang: 'x-default', href: new URL(en, SITE_URL).href },
  ];
};
