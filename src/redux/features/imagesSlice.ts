import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import RestAPI from '../../dao/RestAPI';
import {RootState} from '../store';


export interface ImageStoreState {
    imageMap: { [uuid: string]: string }
}

const initialState: ImageStoreState = {
  imageMap: {},
};

export const fetchSingleImage = createAsyncThunk<string, string, { state: RootState }>(
    'fetchSingleImage',
    async (uuid: string, {getState}): Promise<string> => {
      if (getState().images.imageMap[uuid]) {
        return getState().images.imageMap[uuid];
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
      state.imageMap[action.meta.arg] = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default imagesSlice.reducer;
