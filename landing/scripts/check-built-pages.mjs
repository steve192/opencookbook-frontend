import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, links, pagePaths } from '../src/site.ts';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const failures = [];
const expect = (ok, message) => ok || failures.push(message);

function read(file) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    failures.push(`missing ${file}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

const fileFor = (path) => (path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1));
const sectionIds = (html) => [...html.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]).sort();

const sitemap = read('sitemap-0.xml');
expect(read('sitemap-index.xml').includes(`${SITE_URL}/sitemap-0.xml`), 'sitemap-index.xml does not list sitemap-0.xml');
expect(!sitemap.includes('404'), 'sitemap contains the 404 page');

for (const [key, pair] of Object.entries(pagePaths)) {
  for (const lang of ['en', 'de']) {
    const path = pair[lang];
    const html = read(fileFor(path));
    const label = `${lang} ${key}`;
    expect(html.includes(`<html lang="${lang}"`), `${label}: wrong lang attribute`);
    expect(html.includes(`rel="canonical" href="${SITE_URL}${path}"`), `${label}: canonical`);
    expect(html.includes(`hreflang="en" href="${SITE_URL}${pair.en}"`), `${label}: hreflang en`);
    expect(html.includes(`hreflang="de" href="${SITE_URL}${pair.de}"`), `${label}: hreflang de`);
    expect(html.includes(`hreflang="x-default" href="${SITE_URL}${pair.en}"`), `${label}: hreflang x-default`);
    expect(html.includes(`property="og:image" content="${SITE_URL}/og-${lang}.png"`), `${label}: og:image`);
    expect(existsSync(join(dist, `og-${lang}.png`)), `og-${lang}.png missing`);
    expect(html.includes('"@type":"SoftwareApplication"'), `${label}: SoftwareApplication JSON-LD`);
    expect(!html.includes('FAQPage'), `${label}: FAQPage markup`);
    expect((html.match(/<h1[ >]/g) ?? []).length === 1, `${label}: needs exactly one h1`);

    expect(sitemap.includes(`<loc>${SITE_URL}${path}</loc>`), `${label}: not in sitemap`);
    expect(sitemap.includes(`hreflang="x-default" href="${SITE_URL}${pair.en}"`), `${label}: sitemap x-default`);

    const required = [links.signup, links.imprint, links.privacy, links.terms, links.github];
    for (const href of key === 'home' ? required : [links.github]) {
      expect(html.includes(`href="${href}"`), `${label}: missing link ${href}`);
    }
  }
}

const enIds = sectionIds(read('index.html'));
const deIds = sectionIds(read('de/index.html'));
expect(enIds.length > 0 && enIds.join() === deIds.join(), `home section ids differ: ${enIds} vs ${deIds}`);
expect(sectionIds(read('self-hosting/index.html')).join() === sectionIds(read('de/selbst-hosten/index.html')).join(), 'guide section ids differ');
expect(read('self-hosting/index.html').includes('data-copy-code'), 'guide: copy button');

const notFound = read('404.html');
expect(/<meta name="robots" content="noindex"/.test(notFound), '404: not noindex');
expect(notFound.includes(`href="${pagePaths.home.en}"`) && notFound.includes(`href="${pagePaths.home.de}"`), '404: home links');

const robots = read('robots.txt');
expect(robots.includes('Disallow: /app/') && robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`), 'robots.txt');

// Rules of the owner: no claims about ads or tracking, no data citation on the page.
const bannedPhrases = ['Werbung', 'werbefrei', 'Tracking', 'ads', 'ad-free', 'Max Rubner-Institut (2025)', 'CC BY 4.0', 'FoodData Central'];
const bannedPattern = (phrase) => new RegExp(`(?<![\\p{L}\\p{N}])${phrase.replace(/[()]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'iu');

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith('.html')) yield path;
  }
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  // The clone URL and the directory it creates legitimately carry the repository name.
  const text = html.replace(/https?:\/\/[^\s"'<>]+/g, '').replace('cd opencookbook/compose', '');
  const name = file.slice(dist.length + 1);
  expect(!/opencookbook/i.test(text), `${name}: mentions OpenCookbook`);
  expect(!/open[ -]source/i.test(text), `${name}: mentions open source`);
  // Markup (class names such as tracking-tight) is not copy.
  const visibleText = text.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]*>/g, ' ');
  for (const phrase of bannedPhrases) {
    expect(!bannedPattern(phrase).test(visibleText), `${name}: mentions "${phrase}"`);
  }
  expect(!/[\u2013\u2014]/.test(html), `${name}: contains an en or em dash`);
  for (const [, path, fragment] of html.matchAll(/href="(\/[^"#]*)?#([^"]+)"/g)) {
    const target = path ? read(fileFor(path)) : html;
    expect(target.includes(`id="${fragment}"`), `${name}: #${fragment} has no target`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((f) => `FAIL ${f}`).join('\n'));
  process.exit(1);
}
console.log('Built pages ok.');
