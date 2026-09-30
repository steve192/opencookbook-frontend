import {AxiosError} from 'axios';
import AppPersistence from '../../AppPersistence';
import RestAPI, {ShoppingItem, ShoppingList, ShoppingOp} from '../../dao/RestAPI';
import {newClientId} from '../clientId';
import {
  ShoppingState,
  shoppingChangesReceived,
  shoppingHydrated,
  shoppingListsLoaded,
  shoppingOpQueued,
  shoppingVocabularyLoaded,
} from '../../redux/features/shoppingSlice';
import type {AppDispatch, RootState} from '../../redux/store';
import {DistributiveOmit} from '../types';
import {copyOf, StoredListSync, timedPending} from './listItems';

type Thunk<T = void> = (dispatch: AppDispatch, getState: () => RootState) => Promise<T>;

type StoredShopping = Partial<Omit<ShoppingState, 'sync'>> & {sync?: Record<number, StoredListSync>};

/** Several taps in a row go to the server as one batch. */
const FLUSH_DELAY_MILLIS = 300;
/** Too many for any list, far below what the server accepts per batch. */
const MAX_OPS_PER_BATCH = 200;

const inFlight = new Set<number>();
const syncAgain = new Set<number>();
const flushTimers = new Map<number, ReturnType<typeof setTimeout>>();

const listOf = (state: RootState, listId: number): ShoppingList | undefined =>
  state.shopping.lists.find((list) => list.id === listId);

// A batch the server refuses as malformed would be refused for ever, so it is dropped instead.
const isRefused = (error: unknown) => (error as AxiosError)?.response?.status === 400;
const isGone = (error: unknown) => (error as AxiosError)?.response?.status === 404;

/**
 * Sends what this device changed on a list and takes in what others changed. Safe to call at any
 * time: offline it does nothing, and while a sync of the list runs it only asks for another.
 *
 * @param {number} listId which list
 * @return {Thunk} the sync
 */
export const syncShoppingList = (listId: number): Thunk => async (dispatch, getState) => {
  if (!getState().settings.isOnline) {
    return;
  }
  if (inFlight.has(listId)) {
    syncAgain.add(listId);
    return;
  }
  const list = listOf(getState(), listId);
  if (!list) {
    return;
  }
  inFlight.add(listId);
  try {
    const known = getState().shopping.sync[listId];
    const batch = (known?.pending ?? []).slice(0, MAX_OPS_PER_BATCH).map((pending) => pending.op);
    const since = known?.version ?? 0;
    try {
      const changes = batch.length > 0 ?
        await RestAPI.applyShoppingOps(list, since, batch) :
        await RestAPI.getShoppingChanges(list, since);
      dispatch(shoppingChangesReceived({listId, changes, sent: batch.length}));
    } catch (error) {
      if (isRefused(error)) {
        dispatch(shoppingChangesReceived({listId, sent: batch.length,
          changes: await RestAPI.getShoppingChanges(list, 0)}));
      } else if (isGone(error)) {
        await dispatch(loadShoppingLists());
      } else {
        throw error;
      }
    }
    if ((getState().shopping.sync[listId]?.pending.length ?? 0) > 0) {
      syncAgain.add(listId);
    }
  } catch (error) {
    // Offline or the server is down: what is pending stays and goes with the next sync.
    console.info('Shopping list sync postponed', error);
  } finally {
    inFlight.delete(listId);
    if (syncAgain.delete(listId)) {
      void dispatch(syncShoppingList(listId));
    }
  }
};

/** An op before it has its id. */
export type ShoppingChange = DistributiveOmit<ShoppingOp, 'opId'>;

/**
 * Makes a change at once on this device and sends it shortly after, together with any that follow.
 *
 * @param {number} listId which list
 * @param {ShoppingChange} change the change
 * @return {Thunk} the change
 */
export const changeShoppingList = (listId: number, change: ShoppingChange) => (dispatch: AppDispatch) => {
  const op: ShoppingOp = {...change, opId: newClientId()};
  dispatch(shoppingOpQueued({listId, op, at: new Date().toISOString()}));
  clearTimeout(flushTimers.get(listId));
  flushTimers.set(listId, setTimeout(() => {
    flushTimers.delete(listId);
    void dispatch(syncShoppingList(listId));
  }, FLUSH_DELAY_MILLIS));
};

/**
 * Moves items as an add to one list and a delete from the other, so moving works offline like any change.
 *
 * @param {number} fromListId where the items are
 * @param {number} toListId where they go; a name already there asks for more of it
 * @param {ShoppingItem[]} items what to move
 * @return {Thunk} the changes
 */
export const moveShoppingItems = (fromListId: number, toListId: number, items: ShoppingItem[]) =>
  (dispatch: AppDispatch) => items.forEach((item) => {
    dispatch(changeShoppingList(toListId, copyOf(item, newClientId())));
    dispatch(changeShoppingList(fromListId, {type: 'DELETE', itemId: item.id}));
  });

/**
 * Takes in a change the live channel hinted at, unless this device made it or has it already.
 *
 * @param {number} listId which list changed
 * @param {number} version the list's version after the change
 * @return {Thunk} the sync, if one is needed
 */
export const syncShoppingListBehind = (listId: number, version: number): Thunk => async (dispatch, getState) => {
  if ((getState().shopping.sync[listId]?.version ?? 0) < version) {
    await dispatch(syncShoppingList(listId));
  }
};

/**
 * Sends whatever any list still has pending, as after coming back online.
 *
 * @return {Thunk} the syncs
 */
export const syncAllShoppingLists = (): Thunk => async (dispatch, getState) => {
  await Promise.all(getState().shopping.lists.map((list) => dispatch(syncShoppingList(list.id))));
};

/**
 * Every list the person can use; default lists are made by asking.
 *
 * @return {Thunk} the request
 */
export const loadShoppingLists = (): Thunk => async (dispatch) => {
  dispatch(shoppingListsLoaded(await RestAPI.getShoppingLists()));
};

/**
 * What adding needs, kept for adding offline.
 *
 * @return {Thunk} the request
 */
export const loadShoppingVocabulary = (): Thunk => async (dispatch) => {
  dispatch(shoppingVocabularyLoaded(await RestAPI.getShoppingVocabulary()));
};

/**
 * Brings back what this device stored, so the lists are there before the first request answers.
 *
 * @return {Thunk} the reading
 */
export const hydrateShopping = (): Thunk => async (dispatch) => {
  const stored = await AppPersistence.getShoppingOffline<StoredShopping>().catch(() => null);
  const now = new Date().toISOString();
  const sync = stored?.sync && Object.fromEntries(Object.entries(stored.sync)
      .map(([listId, held]) => [listId, {...held, pending: timedPending(held.pending, now)}]));
  dispatch(shoppingHydrated(stored && {...stored, sync}));
};

/**
 * Stores the shopping state whenever it changed, which is how an offline change survives the
 * app being closed before it was sent.
 *
 * @param {object} store the redux store
 * @return {Function} stops storing
 */
export const persistShopping = (store: {getState: () => RootState, subscribe: (listener: () => void) => () => void}) => {
  let stored: ShoppingState | undefined;
  return store.subscribe(() => {
    const shopping = store.getState().shopping;
    if (shopping === stored || !shopping.hydrated) {
      return;
    }
    stored = shopping;
    const {lists, activeListId, sync, tiles, unitWords} = shopping;
    AppPersistence.storeShoppingOffline({lists, activeListId, sync, tiles, unitWords})
        .catch((error) => console.error('Storing the shopping lists failed', error));
  });
};
