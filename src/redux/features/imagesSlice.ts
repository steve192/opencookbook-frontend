import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import * as FileSystem from 'expo-file-system/legacy';
import {Platform} from 'react-native';
import {Cache} from 'react-native-cache';
import RestAPI from '../../dao/RestAPI';
import {RootState} from '../store';


export interface ImageStoreState {
    imageMap: { [uuid: string]: string }
    thumbnailImageMap: { [uuid: string]: string }
}

/**
 * Which image to load, and how it may be reached.
 *
 * The cache is keyed by the uuid alone: an image is the same bytes whether it is read as its
 * owner or through somebody's share link, so how it was fetched has no business in the key.
 */
export interface ImageRequest {
    uuid: string;
    /** The share to read the image through, rather than reading it as its owner. */
    viaShare?: string;
}

const initialState: ImageStoreState = {
  imageMap: {},
  thumbnailImageMap: {},
};

const imageCache = new Cache({
  namespace: 'imagecache',
  policy: {
    maxEntries: 200, // if unspecified, it can have unlimited entries
    stdTTL: 0, // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage,
});

const ensureDirExists = async (dir: string) => {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, {intermediates: true});
  }
};

const FULL_IMAGE_DIRECTORY = FileSystem.cacheDirectory + '/images/';
const THUMBNAIL_DIRECTORY = FileSystem.cacheDirectory + '/images/thumbnails/';

/**
 * An image already held on this device, if there is one.
 *
 * @param {string} directory where images of that size are kept
 * @param {string} uuid the image
 * @return {Promise<string | undefined>} the cached data uri, or undefined
 */
const readFromDevice = async (directory: string, uuid: string): Promise<string | undefined> => {
  if (Platform.OS !== 'android') {
    return undefined;
  }
  try {
    return await FileSystem.readAsStringAsync(directory + uuid);
  } catch (e) {
    return undefined;
  }
};

/**
 * Keeps an image on this device for next time.
 *
 * @param {string} directory where images of that size are kept
 * @param {string} uuid the image
 * @param {string} dataUri what was fetched
 */
const writeToDevice = (directory: string, uuid: string, dataUri: string) => {
  if (Platform.OS !== 'android') {
    return;
  }
  ensureDirExists(directory)
      .then(() => FileSystem.writeAsStringAsync(directory + uuid, dataUri))
      .catch((e) => console.error('Error caching image', e));
};

export const fetchSingleImage = createAsyncThunk<string, ImageRequest, { state: RootState }>(
    'fetchSingleImage',
    async ({uuid, viaShare}, {getState}): Promise<string> => {
      const alreadyLoaded = getState().images.imageMap[uuid];
      if (alreadyLoaded) {
        return alreadyLoaded;
      }
      const cached = await readFromDevice(FULL_IMAGE_DIRECTORY, uuid);
      if (cached) {
        return cached;
      }

      const fetched = await RestAPI.getImageAsDataURI(uuid, viaShare);
      writeToDevice(FULL_IMAGE_DIRECTORY, uuid, fetched);
      return fetched;
    },
);
export const fetchSingleThumbnailImage = createAsyncThunk<string, ImageRequest, { state: RootState }>(
    'fetchSingleThumbnailImage',
    async ({uuid, viaShare}, {getState}): Promise<string> => {
      const alreadyLoaded = getState().images.thumbnailImageMap[uuid];
      if (alreadyLoaded) {
        return alreadyLoaded;
      }
      const cached = await readFromDevice(THUMBNAIL_DIRECTORY, uuid) ??
        await imageCache.get(thumbnailCacheKey(uuid));
      if (cached) {
        return cached;
      }

      const fetched = await RestAPI.getThumbnailImageAsDataURI(uuid, viaShare);
      if (Platform.OS === 'android') {
        writeToDevice(THUMBNAIL_DIRECTORY, uuid, fetched);
      } else {
        imageCache.set(thumbnailCacheKey(uuid), fetched);
      }
      return fetched;
    },
);

/**
 * The key a thumbnail is kept under off Android.
 *
 * Reading and writing used to spell this differently - the read asked for the literal string
 * "uuid-thumbnail" - so the cache never once produced a hit.
 *
 * @param {string} uuid the image
 * @return {string} its cache key
 */
const thumbnailCacheKey = (uuid: string) => uuid + '-thumbnail';

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
  },
  // Nothing but state goes in here. Writing the device cache from a reducer made it a side
  // effect of reducing, and ran on every fulfilled action - rewriting the very file the value
  // had just been read from.
  extraReducers: (builder) => {
    builder.addCase(fetchSingleImage.fulfilled, (state, action) => {
      state.imageMap[action.meta.arg.uuid] = action.payload;
    });

    builder.addCase(fetchSingleThumbnailImage.fulfilled, (state, action) => {
      state.thumbnailImageMap[action.meta.arg.uuid] = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default imagesSlice.reducer;
