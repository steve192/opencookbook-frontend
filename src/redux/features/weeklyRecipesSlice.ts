import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import RestAPI, { WeekplanDay } from '../../dao/RestAPI';


export interface WeeklyRecipesState {
    weekplanDays: WeekplanDay[];
}

const initialState: WeeklyRecipesState = {
    weekplanDays: [],
}

export const fetchWeekplanDays = createAsyncThunk(
    'fetchWeekplanDays',
    async (parameters: { from: XDate, to: XDate }, thunkAPI): Promise<WeekplanDay[]> => {
        return RestAPI.getWeekplanDays(parameters.from, parameters.to);
    }
);
export const updateSingleWeekplanDay = createAsyncThunk(
    'updateSingleWeekplanDay',
    async (weekplanDay: WeekplanDay, thunkAPI): Promise<WeekplanDay> => {
        return RestAPI.setWeekplanRecipes(
            weekplanDay.day,
            //@ts-ignore Cannot be undefined
            weekplanDay.recipes
                .filter(recipe => recipe.id)
                .map(recipe => recipe.id));
    }
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
            state.weekplanDays = state.weekplanDays.concat(action.payload);
        })
        builder.addCase(updateSingleWeekplanDay.fulfilled, (state, action) => {
            if (!state.weekplanDays.find(weekplanDay => weekplanDay.day === action.meta.arg.day)) {
                // Newly added
                state.weekplanDays.push(action.payload);
                return;
            }
            state.weekplanDays.forEach((weekplanDay, index) => {
                if (weekplanDay.day === action.meta.arg.day) {
                    state.weekplanDays[index] = action.payload;
                }
            });
        })
    }
})

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default weeklyRecipesSlice.reducer