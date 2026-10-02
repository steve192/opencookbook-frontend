// Copies the app icon to public/favicon.png (gitignored) before dev and build.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const icon = fileURLToPath(new URL('../../assets/icon.png', import.meta.url));
const target = fileURLToPath(new URL('../public/favicon.png', import.meta.url));

if (!existsSync(icon)) {
  console.error(`sync-assets: app icon not found at ${icon}`);
  process.exit(1);
}
mkdirSync(new URL('../public', import.meta.url), { recursive: true });
copyFileSync(icon, target);
