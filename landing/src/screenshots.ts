import type { ImageMetadata } from 'astro';
import type { ToolDefinition } from './tools';

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

/** Every screen is taken on a phone; the kitchen tools on a desktop too. */
export type Device = 'phone' | 'desktop';

const files = import.meta.glob<{ default: ImageMetadata }>('./assets/screenshots/*/*/*.webp', {
  eager: true,
});

function load(lang: string, device: Device, name: string): ImageMetadata {
  const path = `./assets/screenshots/${lang}/${device}/${name}.webp`;
  const file = files[path];
  if (!file) {
    throw new Error(`Missing screenshot src${path.slice(1)}`);
  }
  return file.default;
}

export function screenshot(lang: string, name: ScreenshotName): ImageMetadata {
  return load(lang, 'phone', name);
}

export function toolScreenshot(lang: string, tool: ToolDefinition, device: Device): ImageMetadata {
  return load(lang, device, `tool-${tool.slug}`);
}
