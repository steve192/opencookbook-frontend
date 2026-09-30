import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {logout} from '../redux/features/authSlice';

export type OfflineReason = 'no-network' | 'unreachable';

export interface ConnectivityState {
  online: boolean;
  reason: OfflineReason | null;
  /** End of the last complete sync for offline use. */
  lastSyncedAt: number | null;
}

const initialState: ConnectivityState = {online: true, reason: null, lastSyncedAt: null};

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    wentOffline: (state, action: PayloadAction<OfflineReason>) => {
      state.online = false;
      state.reason = action.payload;
    },
    wentOnline: (state) => {
      state.online = true;
      state.reason = null;
    },
    // Asks the probe to check at once instead of waiting for its next turn.
    probeRequested: () => undefined,
    synced: {
      reducer: (state, action: PayloadAction<number>) => {
        state.lastSyncedAt = action.payload;
      },
      prepare: () => ({payload: Date.now()}),
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.lastSyncedAt = null;
    });
  },
});

export const {wentOffline, wentOnline, probeRequested, synced} = connectivitySlice.actions;

export const selectIsOnline = (state: {connectivity: ConnectivityState}) => state.connectivity.online;

export default connectivitySlice.reducer;
