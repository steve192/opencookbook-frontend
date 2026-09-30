import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ShoppingChanges, ShoppingList, ShoppingTile, ShoppingVocabulary} from '../../api/types/shopping';
import {ListSync, PendingOp, withChanges} from '../../helper/shopping/listItems';
import {logout} from './authSlice';

export interface ShoppingState {
  lists: ShoppingList[];
  /** The list the shopping tab shows. */
  activeListId: number | null;
  sync: Record<number, ListSync>;
  /** What to tap when adding; kept for adding offline. */
  tiles: ShoppingTile[];
  /** What makes "2 kg" an amount when typing; kept for adding offline. */
  unitWords: string[];
}

const initialState: ShoppingState = {lists: [], activeListId: null, sync: {}, tiles: [], unitWords: []};

const syncOf = (state: ShoppingState, listId: number): ListSync => {
  state.sync[listId] ??= {server: {}, version: 0, pending: []};
  return state.sync[listId];
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    shoppingListsLoaded: (state, action: PayloadAction<ShoppingList[]>) => {
      state.lists = action.payload;
      const ids = new Set(action.payload.map((list) => list.id));
      Object.keys(state.sync).map(Number).filter((id) => !ids.has(id)).forEach((id) => delete state.sync[id]);
      if (state.activeListId === null || !ids.has(state.activeListId)) {
        state.activeListId = action.payload[0]?.id ?? null;
      }
    },
    shoppingListChosen: (state, action: PayloadAction<number>) => {
      state.activeListId = action.payload;
    },
    shoppingOpQueued: (state, action: PayloadAction<{listId: number} & PendingOp>) => {
      const {listId, op, at} = action.payload;
      syncOf(state, listId).pending.push({op, at});
    },
    // `sent`: how many of the oldest pending ops the answer confirms.
    shoppingChangesReceived: (state, action: PayloadAction<{listId: number, changes: ShoppingChanges, sent: number}>) => {
      const sync = syncOf(state, action.payload.listId);
      sync.pending.splice(0, action.payload.sent);
      sync.server = withChanges(sync.server, action.payload.changes);
      sync.version = action.payload.changes.version;
    },
    shoppingVocabularyLoaded: (state, action: PayloadAction<ShoppingVocabulary>) => {
      state.tiles = action.payload.tiles;
      state.unitWords = action.payload.unitWords;
    },
  },
  extraReducers: (builder) => {
    // Nothing of one account's lists may be shown to whoever signs in next.
    builder.addCase(logout, () => initialState);
  },
});

export const {shoppingListsLoaded, shoppingListChosen, shoppingOpQueued, shoppingChangesReceived,
  shoppingVocabularyLoaded} = shoppingSlice.actions;

export default shoppingSlice.reducer;
