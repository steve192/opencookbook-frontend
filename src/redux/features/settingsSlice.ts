import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import RestAPI, {InstanceInfo, ShoppingProvider} from '../../dao/RestAPI';
import {logout} from './authSlice';


type themes = 'light' | 'dark' | 'system';
type InstanceFeatures =
  Pick<InstanceInfo, 'sharingEnabled' | 'householdsEnabled' | 'ocrImportEnabled' | 'apiKeysEnabled'>;
export interface SettingsState {
    theme: themes;
    backendUrl: string;
    isOnline: boolean;
    /** Whether this instance publishes recipes at all. Operators can turn it off. */
    sharingEnabled: boolean;
    /** Whether this instance has households. Operators can turn them off. */
    householdsEnabled: boolean;
    /** Whether this instance can read a recipe from a photograph. */
    ocrImportEnabled: boolean;
    /** Whether accounts on this instance may create api keys. */
    apiKeysEnabled: boolean;
    /** Where shopping imports go; null until the first import asked, undefined until the account is read. */
    shoppingProvider: ShoppingProvider | null | undefined;
}

const initialState: SettingsState = {
  theme: 'system',
  backendUrl: '',
  isOnline: true,
  // Assumed until the instance says otherwise, so a failed or slow lookup does not take a
  // working feature away.
  sharingEnabled: true,
  householdsEnabled: true,
  // The opposite default to sharing: most instances have no machine learning subsystem, and
  // offering a scan that cannot work is worse than offering it a moment late.
  ocrImportEnabled: false,
  // Off until the instance says so, as for scanning.
  apiKeysEnabled: false,
  shoppingProvider: undefined,
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
    applyInstanceInfo: (state, action: PayloadAction<InstanceFeatures>) => {
      state.sharingEnabled = action.payload.sharingEnabled;
      state.householdsEnabled = action.payload.householdsEnabled;
      state.ocrImportEnabled = action.payload.ocrImportEnabled;
      state.apiKeysEnabled = action.payload.apiKeysEnabled ?? false;
    },
    changeShoppingProvider: (state, action: PayloadAction<ShoppingProvider | null>) => {
      state.shoppingProvider = action.payload;
    },
    changeOnlineState: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      RestAPI.setIsOnline(action.payload);
    },
  },
  extraReducers: (builder) => {
    // The provider is the account's: whoever signs in next is read anew.
    builder.addCase(logout, (state) => {
      state.shoppingProvider = undefined;
    });
  },
});

// Action creators are generated for each case reducer function
export const {changeTheme, changeBackendUrl, applyInstanceInfo, changeOnlineState, changeShoppingProvider} =
  settingsSlice.actions;

export default settingsSlice.reducer;
