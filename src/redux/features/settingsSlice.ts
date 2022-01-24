import {createSlice, PayloadAction} from '@reduxjs/toolkit';


type themes = 'light' | 'dark';
export interface SettingsState {
    theme: themes;
    backendUrl: string;
}

const initialState: SettingsState = {
  theme: 'light',
  backendUrl: '',
};

export const authSlice = createSlice({
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

// Action creators are generated for each case reducer function
export const {changeTheme, changeBackendUrl} = authSlice.actions;

export default authSlice.reducer;
