import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import * as FileSystem from 'expo-file-system';
import {Platform} from 'react-native';
import {Cache} from 'react-native-cache';
import RestAPI from '../../dao/RestAPI';
import {RootState} from '../store';


export interface ImageStoreState {
    imageMap: { [uuid: string]: string }
    thumbnailImageMap: { [uuid: string]: string }
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

export const fetchSingleImage = createAsyncThunk<string, string, { state: RootState }>(
    'fetchSingleImage',
    async (uuid: string, {getState}): Promise<string> => {
      if (getState().images.imageMap[uuid]) {
        return getState().images.imageMap[uuid];
      }
      let cached = undefined;
      if (Platform.OS === 'android') {
        try {
          cached = await FileSystem.readAsStringAsync(FileSystem.cacheDirectory + '/images/' + uuid);
        } catch (e) {
          cached = undefined;
        }
      } else {
        // cached = await imageCache.get('uuid');
      }
      if (cached) {
        // @ts-ignore
        return cached;
      }
      console.warn('not cached');
      return RestAPI.getImageAsDataURI(uuid);
    },
);
export const fetchSingleThumbnailImage = createAsyncThunk<string, string, { state: RootState }>(
    'fetchSingleThumbnailImage',
    async (uuid: string, {getState}): Promise<string> => {
      if (getState().images.thumbnailImageMap[uuid]) {
        return getState().images.thumbnailImageMap[uuid];
      }
      let cached = undefined;
      if (Platform.OS === 'android') {
        try {
          cached = await FileSystem.readAsStringAsync(FileSystem.cacheDirectory + '/images/thumbnails/' + uuid);
        } catch (e) {
          cached = undefined;
        }
      } else {
        cached = await imageCache.get('uuid-thumbnail');
      }
      if (cached) {
        // @ts-ignore
        return cached;
      }
      console.warn('not cached');
      return RestAPI.getThumbnailImageAsDataURI(uuid);
    },
);

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    // changeTheme: (state, action: PayloadAction<themes>) => {
    //     state.theme = action.payload;
    // }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSingleImage.fulfilled, (state, action) => {
      if (Platform.OS === 'android') {
        ensureDirExists(FileSystem.cacheDirectory + '/images/').then(() => {
          FileSystem.writeAsStringAsync(FileSystem.cacheDirectory + '/images/' + action.meta.arg, action.payload ).catch((e) => {
            console.error('Error caching image', e);
          });
        }).catch((e) => {
          console.error('error creating image cache dir', e);
        });
      } else {
        // imageCache.set(action.meta.arg, action.payload);
      }
      state.imageMap[action.meta.arg] = action.payload;
    });

    builder.addCase(fetchSingleThumbnailImage.fulfilled, (state, action) => {
      if (Platform.OS === 'android') {
        ensureDirExists(FileSystem.cacheDirectory + '/images/thumbnails/').then(() => {
          FileSystem.writeAsStringAsync(FileSystem.cacheDirectory + '/images/thumbnails/' + action.meta.arg, action.payload ).catch((e) => {
            console.error('Error caching image', e);
          });
        }).catch((e) => {
          console.error('error creating image cache dir', e);
        });
      } else {
        imageCache.set(action.meta.arg + '-thumbnail', action.payload);
      }
      state.thumbnailImageMap[action.meta.arg] = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default imagesSlice.reducer;
