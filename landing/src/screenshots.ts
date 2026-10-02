import type { ImageMetadata } from 'astro';

export const screenshotNames = [
  'recipe-list',
  'recipe-detail',
  'weekplan',
  'shopping-list',
  'guided-cooking',
  'recipe-scan',
  'recipe-import',
  'household',
  'nutrition',
  'week-suggestion',
] as const;

export type ScreenshotName = (typeof screenshotNames)[number];

const files = import.meta.glob<{ default: ImageMetadata }>('./assets/screenshots/*/*.webp', {
  eager: true,
});

export function screenshot(lang: string, name: ScreenshotName): ImageMetadata {
  const file = files[`./assets/screenshots/${lang}/${name}.webp`];
  if (!file) {
    throw new Error(`Missing screenshot src/assets/screenshots/${lang}/${name}.webp`);
  }
  return file.default;
}
