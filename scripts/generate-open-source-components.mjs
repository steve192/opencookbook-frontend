#!/usr/bin/env node
// Lists every third-party component the app ships, with its license and notices, for the open-source
// licenses screen, which shows it next to the server's. Runs on every Metro start (see metro.config.js);
// writes only when something changed. Without versions: a name and its license is what is credited.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputPath = path.join(root, 'src', 'legal', 'openSourceComponents.generated.json');

// Development dependencies whose content ends up in the app anyway: the shopping icons are rendered from it.
const SHIPPED_DEV_PACKAGES = new Set(['@iconify-json/fluent-emoji-flat']);

const LICENSE_FILES = ['LICENSE', 'LICENCE', 'COPYING'];
const NOTICE_FILES = ['NOTICE', 'AUTHORS'];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const licenseOf = (value) => {
  if (!value) return 'UNKNOWN';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(licenseOf).join(' OR ');
  return value.type ?? value.name ?? 'UNKNOWN';
};

const authorOf = (author) => typeof author === 'object' && author !== null ?
  [author.name, author.email, author.url].filter(Boolean).join(' ') : (author ?? '');

const repositoryOf = (repository) => typeof repository === 'object' && repository !== null ?
  (repository.url ?? '') : (repository ?? '');

const textFiles = (directory, prefixes) => fs.readdirSync(directory)
    .filter((name) => prefixes.some((prefix) => name.toUpperCase().startsWith(prefix)))
    .sort()
    .map((name) => {
      const content = fs.readFileSync(path.join(directory, name), 'utf8').trim();
      return content ? `===== ${name} =====\n${content}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

const mitLicense = (holder) => `MIT License

Copyright (c) ${holder}.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

/** An Iconify set repackages artwork whose author and license it names in info.json, but carries no license file. */
const iconSetLicense = (directory) => {
  const infoFile = path.join(directory, 'info.json');
  if (!fs.existsSync(infoFile)) return null;
  const info = readJson(infoFile);
  return {
    author: info.author?.name ?? '',
    homepage: info.author?.url ?? '',
    license: info.license?.spdx ?? info.license?.title ?? 'UNKNOWN',
    licenseUrl: info.license?.url ?? '',
    licenseText: info.license?.spdx === 'MIT' && info.author?.name ? mitLicense(info.author.name) : '',
  };
};

const componentOf = (packagePath, lockEntry) => {
  const directory = path.join(root, packagePath);
  const packageFile = path.join(directory, 'package.json');
  if (!fs.existsSync(packageFile)) return null;
  const packageJson = readJson(packageFile);
  const component = {
    name: packageJson.name ?? lockEntry.name,
    license: licenseOf(packageJson.license ?? lockEntry.license),
    licenseUrl: '',
    author: authorOf(packageJson.author),
    homepage: packageJson.homepage ?? repositoryOf(packageJson.repository),
    noticeText: textFiles(directory, NOTICE_FILES),
    licenseText: textFiles(directory, LICENSE_FILES),
  };
  const artwork = SHIPPED_DEV_PACKAGES.has(component.name) ? iconSetLicense(directory) : null;
  return artwork ? {...component, ...artwork} : component;
};

// A package installed in several versions is credited once.
const byName = new Map();
for (const [packagePath, lockEntry] of Object.entries(readJson(path.join(root, 'package-lock.json')).packages ?? {})) {
  const name = packagePath.slice(packagePath.lastIndexOf('node_modules/') + 'node_modules/'.length);
  if (!packagePath.startsWith('node_modules/') || (lockEntry.dev && !SHIPPED_DEV_PACKAGES.has(name))) continue;
  const component = componentOf(packagePath, lockEntry);
  if (component?.name && !byName.has(component.name)) {
    byName.set(component.name, component);
  }
}

const components = [...byName.values()].sort((first, second) => first.name.localeCompare(second.name));
const content = JSON.stringify({components}, null, 1) + '\n';
if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== content) {
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, content);
  console.log(`${components.length} open-source components -> ${path.relative(root, outputPath)}`);
}
