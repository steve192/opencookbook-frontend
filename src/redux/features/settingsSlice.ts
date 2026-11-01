import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type themes = 'light' | 'dark' | 'system';

/** How the recipe editor takes ingredients: one text line each, or amount, unit and name apart. */
export type IngredientEntry = 'text' | 'fields';

export interface SettingsState {
    theme: themes;
    backendUrl: string;
    ingredientEntry: IngredientEntry;
}

const initialState: SettingsState = {
  theme: 'system',
  backendUrl: '',
  ingredientEntry: 'text',
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
    ingredientEntryChosen: (state, action: PayloadAction<IngredientEntry>) => {
      state.ingredientEntry = action.payload;
    },
  },
});

export const {changeTheme, changeBackendUrl, ingredientEntryChosen} = settingsSlice.actions;

export default settingsSlice.reducer;
