import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Configuration from '../../Configuration';


type themes = "light" | "dark";
export interface SettingsState {
    theme: themes;
}

const initialState: SettingsState = {
    theme: "light",
}

export const authSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        changeTheme: (state, action: PayloadAction<themes>) => {
            state.theme = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { changeTheme } = authSlice.actions

export default authSlice.reducer