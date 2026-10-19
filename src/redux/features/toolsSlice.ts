import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ToolId} from '../../tools/registry';
import {UnitSystem} from '../../tools/units';

export interface ToolsState {
  /** Null until the user picks; the device's measurement system decides until then. */
  unitSystem: UnitSystem | null;
  /** The last inputs per tool, in the shape each tool keeps them. */
  inputs: Partial<Record<ToolId, unknown>>;
  /** When somebody without an account last put the sign-up card away. */
  signupHintDismissedAt: number | null;
}

const initialState: ToolsState = {
  unitSystem: null,
  inputs: {},
  signupHintDismissedAt: null,
};

export const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    unitSystemChosen: (state, action: PayloadAction<UnitSystem>) => {
      state.unitSystem = action.payload;
    },
    toolInputsChanged: (state, action: PayloadAction<{tool: ToolId, inputs: unknown}>) => {
      state.inputs[action.payload.tool] = action.payload.inputs;
    },
    signupHintDismissed: (state, action: PayloadAction<number>) => {
      state.signupHintDismissedAt = action.payload;
    },
  },
});

export const {unitSystemChosen, toolInputsChanged, signupHintDismissed} = toolsSlice.actions;

export default toolsSlice.reducer;
