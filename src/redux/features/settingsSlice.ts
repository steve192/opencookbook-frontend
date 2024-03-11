import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import RestAPI from '../../dao/RestAPI';


type themes = 'light' | 'dark';
export interface SettingsState {
    theme: themes;
    backendUrl: string;
    isOnline: boolean;
}

const initialState: SettingsState = {
  theme: 'light',
  backendUrl: '',
  isOnline: true,
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
    changeOnlineState: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      RestAPI.setIsOnline(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {changeTheme, changeBackendUrl, changeOnlineState} = authSlice.actions;

export default authSlice.reducer;
