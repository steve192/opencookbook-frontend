import {downloadImage, FULL_IMAGES_KEPT, ImageRequest, imageUrl, ImageSize} from './imageRequest';

const CACHE_NAMES: Record<ImageSize, string> = {thumbnail: 'recipe-thumbnails', full: 'recipe-images'};

// An object url keeps its blob in memory. Thumbnails are bounded by the size of the cookbook, but full-size
// images add up in a page left open for days, so only the last ones used keep theirs.
const OBJECT_URLS_KEPT: Record<ImageSize, number> = {thumbnail: Infinity, full: 20};

// One object url per image, the least recently used first.
const objectUrls: Record<ImageSize, Map<string, string>> = {thumbnail: new Map(), full: new Map()};

const used = ({uuid, size}: ImageRequest, url: string) => {
  const urls = objectUrls[size];
  urls.delete(uuid);
  urls.set(uuid, url);
  if (urls.size > OBJECT_URLS_KEPT[size]) {
    const [oldest, oldestUrl] = urls.entries().next().value!;
    URL.revokeObjectURL(oldestUrl);
    urls.delete(oldest);
  }
  return url;
};

const remembered = (request: ImageRequest, blob: Blob) =>
  used(request, objectUrls[request.size].get(request.uuid) ?? URL.createObjectURL(blob));

// Plain http origins have no Cache Storage.
const cacheOf = (size: ImageSize) => globalThis.caches ? caches.open(CACHE_NAMES[size]) : undefined;

const stored = async (request: ImageRequest) => (await cacheOf(request.size))?.match(await imageUrl(request));

// Cache Storage lists its entries in the order they were put.
const keepNewest = async (cache: Cache) => {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, -FULL_IMAGES_KEPT).map((key) => cache.delete(key)));
};

const download = async (request: ImageRequest) => {
  const blob = await downloadImage<Blob>(request, 'blob');
  const cache = await cacheOf(request.size);
  if (cache) {
    await cache.put(await imageUrl(request), new Response(blob));
    if (request.size === 'full') {
      await keepNewest(cache);
    }
  }
  return blob;
};

export const cachedImage = async (request: ImageRequest): Promise<string | undefined> => {
  const known = objectUrls[request.size].get(request.uuid);
  if (known) {
    return used(request, known);
  }
  const response = await stored(request);
  return response ? remembered(request, await response.blob()) : undefined;
};

export const downloadToCache = async (request: ImageRequest): Promise<string> =>
  remembered(request, await download(request));

export const prefetchImage = async (request: ImageRequest) => {
  if (!await stored(request)) {
    await download(request);
  }
};

export const clearImageCache = async () => {
  Object.values(objectUrls).forEach((urls) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls.clear();
  });
  await Promise.all(Object.values(CACHE_NAMES).map((name) => globalThis.caches?.delete(name)));
};
