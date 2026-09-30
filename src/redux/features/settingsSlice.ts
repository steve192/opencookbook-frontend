import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type themes = 'light' | 'dark' | 'system';

export interface SettingsState {
    theme: themes;
    backendUrl: string;
}

const initialState: SettingsState = {
  theme: 'system',
  backendUrl: '',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    changeTheme: (state, action: PayloadAction<themes>) => {
      state.theme = action.payload;
    },
    changeBackendUrl: (state, action: PayloadAction<string>) => {
      state.backendUrl = action.payload;
    },
  },
});

export const {changeTheme, changeBackendUrl} = settingsSlice.actions;

export default settingsSlice.reducer;
