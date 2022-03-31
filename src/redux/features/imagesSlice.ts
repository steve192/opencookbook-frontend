import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Cache} from 'react-native-cache';
import RestAPI from '../../dao/RestAPI';
import {RootState} from '../store';


export interface ImageStoreState {
    imageMap: { [uuid: string]: string }
}

const initialState: ImageStoreState = {
  imageMap: {},
};

const imageCache = new Cache({
  namespace: 'imagecache',
  policy: {
    maxEntries: 200, // if unspecified, it can have unlimited entries
    stdTTL: 0, // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage,
});

export const fetchSingleImage = createAsyncThunk<string, string, { state: RootState }>(
    'fetchSingleImage',
    async (uuid: string, {getState}): Promise<string> => {
      if (getState().images.imageMap[uuid]) {
        return getState().images.imageMap[uuid];
      }
      const cached = await imageCache.get('uuid');
      if (cached) {
        // @ts-ignore
        return cached;
      }
      return RestAPI.getImageAsDataURI(uuid);
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
      imageCache.set(action.meta.arg, action.payload);
      state.imageMap[action.meta.arg] = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default imagesSlice.reducer;
