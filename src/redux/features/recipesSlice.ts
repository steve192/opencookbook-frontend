import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import RestAPI, { Recipe, RecipeGroup } from '../../dao/RestAPI';
import { RootState } from '../store';


export interface RecipesState {
    recipes: Recipe[];
    recipeGroups: RecipeGroup[];
    loading: boolean;

}

const initialState: RecipesState = {
    recipes: [],
    recipeGroups: [],
    loading: false
}

export const fetchMyRecipes = createAsyncThunk(
    'fetchMyRecipes',
    async (): Promise<Recipe[]> => {
        return RestAPI.getRecipes();
    }
);
export const fetchSingleRecipe = createAsyncThunk<Recipe, number, { state: RootState }>(
    'fetchSingleRecipe',
    async (recipeId: number, { getState }): Promise<Recipe> => {
        if (getState().recipes.recipes.find(recipe => recipe.id === recipeId)) {
            //Already exists
            return getState().recipes.recipes.filter(recipe => recipe.id === recipeId)[0];
        }
        return RestAPI.getRecipeById(recipeId);
    }
);
export const fetchMyRecipeGroups = createAsyncThunk(
    'fetchMyRecipeGroups',
    async (): Promise<RecipeGroup[]> => {
        return RestAPI.getRecipeGroups();
    }
);

export const updateRecipe = createAsyncThunk<Recipe, Recipe, { state: RootState }>(
    'updateRecipe',
    async (recipe: Recipe, { getState }): Promise<Recipe> => {
        return RestAPI.updateRecipe(recipe);
    }
);

export const createRecipe = createAsyncThunk<Recipe, Recipe, { state: RootState }>(
    'createRecipe',
    async (recipe: Recipe, { getState }): Promise<Recipe> => {
        return RestAPI.createNewRecipe(recipe);
    }
);
export const deleteRecipe = createAsyncThunk<void, Recipe, { state: RootState }>(
    'deleteRecipe',
    async (recipe: Recipe, { getState }): Promise<void> => {
        return RestAPI.deleteRecipe(recipe);
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
        builder.addCase(fetchSingleRecipe.fulfilled, (state, action) => {
            if (!state.recipes.find(recipe => recipe.id === action.meta.arg)) {
                // Newly added
                state.recipes.push(action.payload);
                return;
            }
            state.recipes.forEach((recipe, index) => {
                if (recipe.id === action.meta.arg) {
                    state.recipes[index] = action.payload;
                }
            });
        })
        builder.addCase(createRecipe.fulfilled, (state, action) => {
            state.recipes.push(action.payload);
        })
        builder.addCase(deleteRecipe.fulfilled, (state, action) => {
            state.recipes.forEach((recipe, index) => {
                if (recipe.id === action.meta.arg.id) {
                    state.recipes.splice(index, 1);
                }
            });
        })

        builder.addCase(updateRecipe.fulfilled, (state, action) => {
            state.recipes.forEach((recipe, index) => {
                if (recipe.id === action.meta.arg.id) {
                    state.recipes[index] = action.payload;
                }
            });
        })
    }
})

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default recipesSlice.reducer