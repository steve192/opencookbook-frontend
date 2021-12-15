import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import Configuration from '../../Configuration';
import RestAPI, { Recipe, WeekplanDay } from '../../dao/RestAPI';


export interface WeeklyRecipesState {
    weekplanDays: WeekplanDay[];
}

const initialState: WeeklyRecipesState = {
    weekplanDays:[],
}

export const fetchWeekplanDays = createAsyncThunk(
    'fetchWeekplanDays',
    async (parameters: {from: XDate, to: XDate},thunkAPI): Promise<WeekplanDay[]> => {
        return RestAPI.getWeekplanDays(parameters.from, parameters.to);
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
    }
})

// Action creators are generated for each case reducer function
// export const { changeTheme } = authSlice.actions

export default weeklyRecipesSlice.reducer