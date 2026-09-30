import {Directory, File, Paths} from 'expo-file-system';
import {downloadImage, FULL_IMAGES_KEPT, ImageRequest} from './imageRequest';

// The document directory, which the system does not clear the way it clears its cache.
const root = () => new Directory(Paths.document, 'images');
const fileOf = ({uuid, size}: ImageRequest) => new File(root(), size, uuid);

const keepNewest = (directory: Directory) => directory.list()
    .filter((entry): entry is File => entry instanceof File)
    .sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0))
    .slice(FULL_IMAGES_KEPT)
    .forEach((file) => file.delete());

export const cachedImage = (request: ImageRequest): Promise<string | undefined> => {
  const file = fileOf(request);
  return Promise.resolve(file.exists ? file.uri : undefined);
};

export const downloadToCache = async (request: ImageRequest): Promise<string> => {
  const bytes = await downloadImage<ArrayBuffer>(request, 'arraybuffer');
  const directory = new Directory(root(), request.size);
  directory.create({intermediates: true, idempotent: true});
  const file = fileOf(request);
  file.write(new Uint8Array(bytes));
  if (request.size === 'full') {
    keepNewest(directory);
  }
  return file.uri;
};

export const prefetchImage = async (request: ImageRequest) => {
  if (!fileOf(request).exists) {
    await downloadToCache(request);
  }
};

export const clearImageCache = () => {
  const directory = root();
  if (directory.exists) {
    directory.delete();
  }
  return Promise.resolve();
};
