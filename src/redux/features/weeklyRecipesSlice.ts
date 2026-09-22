import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import RestAPI, {WeekplanDay, WeekplanDayRecipeInfo, WeekplanDayRecipeRequest} from '../../dao/RestAPI';
import {toDayKey} from '../../helper/weekplan';

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


/**
 * A day exists once per plan, so the day alone does not identify one.
 *
 * @param {WeekplanDay} day the day to key
 * @return {string} a key unique across plans
 */
const planKey = (day: WeekplanDay): string => `${day.householdId ?? ''}|${day.day}`;

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
          weekplanDay.recipes.map(toRequestMeal),
          weekplanDay.householdId);
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
      // The answer covers every plan in the range, so it replaces the range.
      const from = toDayKey(action.meta.arg.from);
      const to = toDayKey(action.meta.arg.to);
      state.weekplanDays = state.weekplanDays.filter((weekplanDay) => weekplanDay.day < from || weekplanDay.day > to);
      state.weekplanDays = state.weekplanDays.concat(action.payload);
    });
    builder.addCase(updateSingleWeekplanDay.fulfilled, (state, action) => {
      if (!state.weekplanDays.some((weekplanDay) => planKey(weekplanDay) === planKey(action.meta.arg))) {
        // Newly added
        state.weekplanDays.push(action.payload);
        return;
      }
      state.weekplanDays.forEach((weekplanDay, index) => {
        if (planKey(weekplanDay) === planKey(action.meta.arg)) {
          state.weekplanDays[index] = action.payload;
        }
      });
    });
  },
});

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default weeklyRecipesSlice.reducer;
