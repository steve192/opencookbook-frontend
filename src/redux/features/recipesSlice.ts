import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import RestAPI, {Recipe, RecipeGroup} from '../../dao/RestAPI';
import {RootState} from '../store';


export interface RecipesState {
    recipes: Recipe[];
    recipeGroups: RecipeGroup[];
    pendingRequests: number;

}

const initialState: RecipesState = {
  recipes: [],
  recipeGroups: [],
  pendingRequests: 0,
};

export const fetchMyRecipes = createAsyncThunk(
    'fetchMyRecipes',
    async (): Promise<Recipe[]> => {
      return RestAPI.getRecipes();
    },
);
export const fetchSingleRecipe = createAsyncThunk<Recipe, number, { state: RootState }>(
    'fetchSingleRecipe',
    async (recipeId: number, {getState}): Promise<Recipe> => {
      if (getState().recipes.recipes.find((recipe) => recipe.id === recipeId)) {
        // Already exists
        return getState().recipes.recipes.filter((recipe) => recipe.id === recipeId)[0];
      }

      return RestAPI.getRecipeById(recipeId);
    },
);
export const fetchMyRecipeGroups = createAsyncThunk(
    'fetchMyRecipeGroups',
    async (): Promise<RecipeGroup[]> => {
      return RestAPI.getRecipeGroups();
    },
);

export const createRecipeGroup = createAsyncThunk<RecipeGroup, RecipeGroup, { state: RootState }>(
    'createRecipeGroup',
    async (recipeGroup: RecipeGroup): Promise<RecipeGroup> => {
      return RestAPI.createNewRecipeGroup(recipeGroup);
    },
);
export const updateRecipeGroup = createAsyncThunk<RecipeGroup, RecipeGroup, { state: RootState }>(
    'updateRecipeGroup',
    async (recipeGroup: RecipeGroup): Promise<RecipeGroup> => {
      return RestAPI.updateRecipeGroup(recipeGroup);
    },
);
export const deleteRecipeGroup = createAsyncThunk<void, number, { state: RootState }>(
    'deleteRecipeGroup',
    async (groupId: number) => {
      RestAPI.deleteRecipeGroup(groupId);
    },
);
export const updateRecipe = createAsyncThunk<Recipe, Recipe, { state: RootState }>(
    'updateRecipe',
    async (recipe: Recipe): Promise<Recipe> => {
      return RestAPI.updateRecipe(recipe);
    },
);

export const importRecipe = createAsyncThunk<Recipe, string, { state: RootState, rejectValue: AxiosError }>(
    'importRecipe',
    async (importURL: string, thunk) => {
      try {
        return await RestAPI.importRecipe(importURL);
      } catch (e) {
        return thunk.rejectWithValue(e as AxiosError);
      }
    },
);

export const createRecipe = createAsyncThunk<Recipe, Recipe, { state: RootState }>(
    'createRecipe',
    async (recipe: Recipe): Promise<Recipe> => {
      return RestAPI.createNewRecipe(recipe);
    },
);
export const deleteRecipe = createAsyncThunk<void, Recipe, { state: RootState }>(
    'deleteRecipe',
    async (recipe: Recipe): Promise<void> => {
      return RestAPI.deleteRecipe(recipe);
    },
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
    builder
        .addCase(fetchMyRecipes.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(fetchMyRecipes.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipes = action.payload;
        })
        .addCase(fetchMyRecipes.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(fetchMyRecipeGroups.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(fetchMyRecipeGroups.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipeGroups = action.payload;
        })
        .addCase(fetchMyRecipeGroups.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(fetchSingleRecipe.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(fetchSingleRecipe.fulfilled, (state, action) => {
          state.pendingRequests--;
          if (!state.recipes.find((recipe) => recipe.id === action.meta.arg)) {
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
        .addCase(fetchSingleRecipe.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(createRecipe.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(createRecipe.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipes.push(action.payload);
        })
        .addCase(createRecipe.rejected, (state) => {
          state.pendingRequests--;
        });
    builder
        .addCase(createRecipeGroup.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(createRecipeGroup.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipeGroups.push(action.payload);
        })
        .addCase(createRecipeGroup.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(deleteRecipe.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(deleteRecipe.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipes.forEach((recipe, index) => {
            if (recipe.id === action.meta.arg.id) {
              state.recipes.splice(index, 1);
            }
          });
        })
        .addCase(deleteRecipe.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(deleteRecipeGroup.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(deleteRecipeGroup.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipeGroups.forEach((group, index) => {
            if (group.id === action.meta.arg) {
              state.recipeGroups.splice(index, 1);
            }
          });
        })
        .addCase(deleteRecipeGroup.rejected, (state) => {
          state.pendingRequests--;
        });

    builder
        .addCase(updateRecipe.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(updateRecipe.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipes.forEach((recipe, index) => {
            if (recipe.id === action.meta.arg.id) {
              state.recipes[index] = action.payload;
            }
          });
        })
        .addCase(updateRecipe.rejected, (state) => {
          state.pendingRequests--;
        });
    builder
        .addCase(updateRecipeGroup.pending, (state) => {
          state.pendingRequests++;
        })
        .addCase(updateRecipeGroup.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipeGroups.forEach((group, index) => {
            if (group.id === action.meta.arg.id) {
              state.recipeGroups[index] = action.payload;
            }
          });
        })
        .addCase(updateRecipeGroup.rejected, (state) => {
          state.pendingRequests--;
        });
    builder
        .addCase(importRecipe.pending, (state, action) => {
          state.pendingRequests++;
        })
        .addCase(importRecipe.fulfilled, (state, action) => {
          state.pendingRequests--;
          state.recipeGroups.push(action.payload);
        })
        .addCase(importRecipe.rejected, (state, action) => {
          state.pendingRequests--;
        });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default recipesSlice.reducer;
