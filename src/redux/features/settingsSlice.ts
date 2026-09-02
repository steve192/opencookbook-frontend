import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import RestAPI from '../../dao/RestAPI';


type themes = 'light' | 'dark' | 'system';
export interface SettingsState {
    theme: themes;
    backendUrl: string;
    isOnline: boolean;
    /** Whether this instance publishes recipes at all. Operators can turn it off. */
    sharingEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  backendUrl: '',
  isOnline: true,
  // Assumed until the instance says otherwise, so a failed or slow lookup does not take a
  // working feature away.
  sharingEnabled: true,
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
    changeSharingEnabled: (state, action: PayloadAction<boolean>) => {
      state.sharingEnabled = action.payload;
    },
    changeOnlineState: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      RestAPI.setIsOnline(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {changeTheme, changeBackendUrl, changeSharingEnabled, changeOnlineState} = authSlice.actions;

export default authSlice.reducer;
