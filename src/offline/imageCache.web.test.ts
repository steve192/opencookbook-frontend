import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cachedImage, clearImageCache, downloadToCache} from './imageCache.web';
import type {ImageRequest} from './imageRequest';

// The real module reaches the api client, which does not resolve under node.
vi.mock('./imageRequest', () => ({
  FULL_IMAGES_KEPT: 300,
  imageUrl: async ({size, uuid}: ImageRequest) => `https://cookpal.test/api/v1/${size}/${uuid}`,
  downloadImage: async () => new Blob(['image']),
}));

// The module keeps this many and does not export it.
const FULL_URLS_KEPT = 20;

const full = (uuid: string): ImageRequest => ({uuid, size: 'full'});
const thumbnail = (uuid: string): ImageRequest => ({uuid, size: 'thumbnail'});
const fullImages = (count: number) => Array.from({length: count}, (_, index) => full('image-' + index));

// One after the other, so the first is the one used longest ago.
const downloadInOrder = async (requests: ImageRequest[]) => {
  const urls: string[] = [];
  for (const request of requests) {
    urls.push(await downloadToCache(request));
  }
  return urls;
};

describe('the object urls of the web image cache', () => {
  let handedOut = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:cookpal.test/${++handedOut}`);
  const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

  beforeEach(async () => {
    await clearImageCache();
    // Clearing revoked what the last test left, which this one must not count.
    revokeObjectURL.mockClear();
  });

  it('lets go of the oldest full-size url when the 21st image comes in', async () => {
    const urls = await downloadInOrder(fullImages(FULL_URLS_KEPT + 1));

    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith(urls[0]);
  });

  it('counts an image that is looked up again as used', async () => {
    const urls = await downloadInOrder(fullImages(FULL_URLS_KEPT));

    expect(await cachedImage(full('image-0'))).toBe(urls[0]);
    await downloadToCache(full('one-too-many'));

    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith(urls[1]);
  });

  it('never lets go of a thumbnail url', async () => {
    const covers = Array.from({length: FULL_URLS_KEPT + 5}, (_, index) => thumbnail('cover-' + index));

    const urls = await downloadInOrder(covers);

    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(await cachedImage(covers[0])).toBe(urls[0]);
  });

  it('lets go of every url it handed out when cleared', async () => {
    const urls = await downloadInOrder([full('soup'), full('salad'), thumbnail('soup'), thumbnail('salad')]);

    await clearImageCache();

    expect(revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual([...urls].sort());
  });
});
