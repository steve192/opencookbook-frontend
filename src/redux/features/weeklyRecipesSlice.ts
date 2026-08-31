import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import RestAPI, {WeekplanDay, WeekplanDayRecipeInfo, WeekplanDayRecipeRequest} from '../../dao/RestAPI';

/**
 * Reduces a stored meal to what the endpoint expects. A saved recipe is
 * referenced by id alone, a spontaneous meal carries its own title.
 *
 * @param {WeekplanDayRecipeInfo} meal meal as it is held in the store
 * @return {WeekplanDayRecipeRequest} the payload for the weekplan endpoint
 */
const toRequestMeal = (meal: WeekplanDayRecipeInfo): WeekplanDayRecipeRequest =>
  meal.type === 'NORMAL_RECIPE' ?
    {id: meal.id, type: meal.type} :
    {id: meal.id, type: meal.type, title: meal.title};


export interface WeeklyRecipesState {
    weekplanDays: WeekplanDay[];
}

const initialState: WeeklyRecipesState = {
  weekplanDays: [],
};

export const fetchWeekplanDays = createAsyncThunk(
    'fetchWeekplanDays',
    async (parameters: { from: XDate, to: XDate }, thunkAPI): Promise<WeekplanDay[]> => {
      return RestAPI.getWeekplanDays(parameters.from, parameters.to);
    },
);
export const updateSingleWeekplanDay = createAsyncThunk(
    'updateSingleWeekplanDay',
    async (weekplanDay: WeekplanDay, thunkAPI): Promise<WeekplanDay> => {
      return RestAPI.setWeekplanRecipes(
          weekplanDay.day,
          weekplanDay.recipes.map(toRequestMeal));
    },
);

export const weeklyRecipesSlice = createSlice({
  name: 'weeklyRecipes',
  initialState,
  reducers: {
    // changeTheme: (state, action: PayloadAction<themes>) => {
    //     state.theme = action.payload;
    // }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWeekplanDays.fulfilled, (state, action) => {
      // Remove if already existing
      state.weekplanDays = state.weekplanDays.filter((weekplanDay) => !action.payload.find((newWeekplanDay) => newWeekplanDay.day === weekplanDay.day));
      state.weekplanDays = state.weekplanDays.concat(action.payload);
    });
    builder.addCase(updateSingleWeekplanDay.fulfilled, (state, action) => {
      if (!state.weekplanDays.find((weekplanDay) => weekplanDay.day === action.meta.arg.day)) {
        // Newly added
        state.weekplanDays.push(action.payload);
        return;
      }
      state.weekplanDays.forEach((weekplanDay, index) => {
        if (weekplanDay.day === action.meta.arg.day) {
          state.weekplanDays[index] = action.payload;
        }
      });
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default weeklyRecipesSlice.reducer;
