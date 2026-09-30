#!/usr/bin/env node
// Renders the icons the web app manifest and iOS ask for from assets/icon.png. Runs on every Metro
// start (see metro.config.js) and renders only when the source changed; the icons are generated,
// never committed.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

// The splash and adaptive icon colour, which a maskable icon and iOS fill the corners with.
const BACKGROUND = '#295700';
// A maskable icon may be cropped to a circle; its content has to stay inside the middle 80 %.
const MASKABLE_SAFE_ZONE = 0.8;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'assets', 'icon.png');
const outDir = path.join(root, 'public', 'icons');
const stampFile = path.join(outDir, '.stamp');

const stamp = crypto.createHash('sha256').update(fs.readFileSync(source)).update(BACKGROUND).digest('hex');
if (fs.existsSync(stampFile) && fs.readFileSync(stampFile, 'utf8') === stamp) {
  process.exit(0);
}
fs.mkdirSync(outDir, {recursive: true});

const plain = (size, file) => sharp(source).resize(size, size).png().toFile(path.join(outDir, file));

const onBackground = async (size, contentSize, file) => {
  const content = await sharp(source).resize(contentSize, contentSize).png().toBuffer();
  const inset = Math.round((size - contentSize) / 2);
  await sharp({create: {width: size, height: size, channels: 4, background: BACKGROUND}})
      .composite([{input: content, top: inset, left: inset}])
      .png()
      .toFile(path.join(outDir, file));
};

await Promise.all([
  plain(192, 'icon-192.png'),
  plain(512, 'icon-512.png'),
  onBackground(192, Math.round(192 * MASKABLE_SAFE_ZONE), 'maskable-192.png'),
  onBackground(512, Math.round(512 * MASKABLE_SAFE_ZONE), 'maskable-512.png'),
  // iOS shows transparency as black.
  onBackground(180, 180, 'apple-touch-icon.png'),
]);
fs.writeFileSync(stampFile, stamp);
console.log('pwa-icons: rendered the web app icons');
