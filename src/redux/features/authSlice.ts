import {createSlice} from '@reduxjs/toolkit';

export interface AuthState {
  loggedIn: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  loggedIn: false,
  isLoading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isLoading = false;
      state.loggedIn = true;
    },
    logout: (state) => {
      state.isLoading = false;
      state.loggedIn = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {login, logout} = authSlice.actions;

export default authSlice.reducer;
