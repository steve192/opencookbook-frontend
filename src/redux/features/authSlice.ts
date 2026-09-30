import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface AuthState {
  loggedIn: boolean
}

const initialState: AuthState = {
  loggedIn: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.loggedIn = true;
    },
    // Signing out or a sign in the server ended: everything of the account leaves the device.
    logout: (state) => {
      state.loggedIn = false;
    },
    // App start: whether a sign in is stored, decided on the device without asking the server.
    sessionRestored: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload;
    },
  },
});

export const {login, logout, sessionRestored} = authSlice.actions;

export const selectLoggedIn = (state: {auth: AuthState}) => state.auth.loggedIn;

export default authSlice.reducer;
