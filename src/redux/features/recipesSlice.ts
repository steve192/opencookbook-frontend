import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import RestAPI, { Recipe, RecipeGroup } from '../../dao/RestAPI';


export interface RecipesState {
    recipes: Recipe[];
    recipeGroups: RecipeGroup[];
    loading: boolean;

}

const initialState: RecipesState = {
    recipes:[],
    recipeGroups: [],
    loading: false
}

export const fetchMyRecipes = createAsyncThunk(
    'fetchMyRecipes',
    async (): Promise<Recipe[]> => {
        return RestAPI.getRecipes();
    }
);
export const fetchMyRecipeGroups = createAsyncThunk(
    'fetchMyRecipeGroups',
    async (): Promise<RecipeGroup[]> => {
        return RestAPI.getRecipeGroups();
    }
);

export const recipesSlice = createSlice({
    name: 'recipes',
    initialState,
    reducers: {
        // changeTheme: (state, action: PayloadAction<themes>) => {
        //     state.theme = action.payload;
        // }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMyRecipes.fulfilled, (state, action) => {
            state.recipes = action.payload;
        })
        builder.addCase(fetchMyRecipeGroups.fulfilled, (state, action) => {
            state.recipeGroups = action.payload;
        })
    }
})

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default recipesSlice.reducer