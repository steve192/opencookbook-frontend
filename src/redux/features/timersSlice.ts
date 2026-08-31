import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CookingTimer, CookingTimers} from '../../helper/cookingTimers';

export interface TimersState {
  /** Running cooking timers, by the key of what they count down */
  timers: CookingTimers;
}

const initialState: TimersState = {
  timers: {},
};

/**
 * Cooking timers live here rather than in the screen that started them, because a timer is
 * about the pot and not about the screen: reading ahead, checking the ingredients or leaving
 * cooking mode entirely must not take time off it, and must not silently drop it.
 */
export const timersSlice = createSlice({
  name: 'timers',
  initialState,
  reducers: {
    timerStarted: (state, action: PayloadAction<{key: string, timer: CookingTimer}>) => {
      state.timers[action.payload.key] = action.payload.timer;
    },
    timerStopped: (state, action: PayloadAction<string>) => {
      delete state.timers[action.payload];
    },
    allTimersStopped: (state) => {
      state.timers = {};
    },
  },
});

export const {timerStarted, timerStopped, allTimersStopped} = timersSlice.actions;

export default timersSlice.reducer;
