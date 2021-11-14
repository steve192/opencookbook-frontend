import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Configuration from '../../Configuration';

export interface AuthState {
  loggedIn: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  loggedIn: false,
  isLoading: false,
}

export const authSlice = createSlice({
  name: 'counter',
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
})

// Action creators are generated for each case reducer function
export const { login, logout } = authSlice.actions

export default authSlice.reducer