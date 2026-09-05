import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import RestAPI from '../../dao/RestAPI';


type themes = 'light' | 'dark' | 'system';
export interface SettingsState {
    theme: themes;
    backendUrl: string;
    isOnline: boolean;
    /** Whether this instance publishes recipes at all. Operators can turn it off. */
    sharingEnabled: boolean;
    /** Whether this instance can read a recipe from a photograph. */
    ocrImportEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  backendUrl: '',
  isOnline: true,
  // Assumed until the instance says otherwise, so a failed or slow lookup does not take a
  // working feature away.
  sharingEnabled: true,
  // The opposite default to sharing: most instances have no machine learning subsystem, and
  // offering a scan that cannot work is worse than offering it a moment late.
  ocrImportEnabled: false,
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
    changeOcrImportEnabled: (state, action: PayloadAction<boolean>) => {
      state.ocrImportEnabled = action.payload;
    },
    changeOnlineState: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      RestAPI.setIsOnline(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {changeTheme, changeBackendUrl, changeSharingEnabled, changeOcrImportEnabled,
  changeOnlineState} = authSlice.actions;

export default authSlice.reducer;
