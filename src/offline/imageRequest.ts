import {apiUrl, READ_TIMEOUT_MILLIS} from '../api/client';
import {sendRequest} from '../api/session';

export type ImageSize = 'thumbnail' | 'full';

// Thumbnails are kept for every recipe; full images only for the ones opened last.
export const FULL_IMAGES_KEPT = 300;

export interface ImageRequest {
  uuid: string;
  size: ImageSize;
  /** Read through this share instead of as the signed in account. */
  viaShare?: string;
}

const imagePath = ({uuid, size, viaShare}: ImageRequest) => {
  const file = (size === 'thumbnail' ? 'thumbnail/' : '') + uuid;
  return viaShare ? `/shared/${viaShare}/images/${file}` : `/recipes-images/${file}`;
};

export const imageUrl = (request: ImageRequest): Promise<string> => apiUrl(imagePath(request));

export const downloadImage = async <T>(request: ImageRequest, responseType: 'arraybuffer' | 'blob'): Promise<T> => {
  // Shared images go without a token: whoever holds the link may have no account.
  const response = await sendRequest<T>({url: await imageUrl(request), method: 'GET', responseType,
    timeout: READ_TIMEOUT_MILLIS}, !!request.viaShare);
  return response.data;
};
