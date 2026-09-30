import XDate from 'xdate';
import {answeredByServer, toApiError} from '../api/ApiError';
import {accountEndpoints} from '../api/endpoints/account';
import {householdEndpoints} from '../api/endpoints/households';
import {nutritionEndpoints} from '../api/endpoints/nutrition';
import {recipeEndpoints} from '../api/endpoints/recipes';
import {weekplanEndpoints} from '../api/endpoints/weekplan';
import {titleImageUuid} from '../helper/recipeImages';
import {withTabLock} from '../helper/tabLock';
import {Recipe} from '../api/types/recipes';
import {addWeeks, startOfWeek, toDayKey} from '../helper/weekplan';
import {selectLoggedIn} from '../redux/features/authSlice';
import type {AppDispatch, RootState} from '../redux/store';
import {selectIsOnline, synced} from './connectivitySlice';
import {prefetchImage} from './imageCache';

/** Last week to four weeks ahead: this week's cooking and shopping ahead. */
export const SYNCED_WEEKS = [-1, 0, 1, 2, 3, 4];

const PARALLEL_DOWNLOADS = 4;

const REFRESH = {subscribe: false, forceRefetch: true};

// A thumbnail the server refuses is left out, so one broken image does not block the rest on every sync.
// Anything else, such as an unreachable server or a full storage, stops the sync.
const prefetchThumbnail = (uuid: string) => prefetchImage({uuid, size: 'thumbnail'}).catch((error) => {
  if (!answeredByServer(error)) {
    throw error;
  }
});

// Stops once signed out: without a token, each download would only ask for a renewal that cannot come.
const prefetchThumbnails = async (recipes: Recipe[], signedIn: () => boolean) => {
  const uuids = recipes.flatMap((recipe) => titleImageUuid(recipe) ?? []);
  for (let start = 0; start < uuids.length && signedIn(); start += PARALLEL_DOWNLOADS) {
    await Promise.all(uuids.slice(start, start + PARALLEL_DOWNLOADS).map(prefetchThumbnail));
  }
};

const syncEverything = async (dispatch: AppDispatch, getState: () => RootState) => {
  if (!selectIsOnline(getState()) || !selectLoggedIn(getState())) {
    return;
  }
  const [, instance] = await Promise.all([
    dispatch(accountEndpoints.getUserInfo.initiate(undefined, REFRESH)).unwrap(),
    dispatch(accountEndpoints.getInstanceInfo.initiate(undefined, REFRESH)).unwrap(),
  ]);
  const [recipes] = await Promise.all([
    dispatch(recipeEndpoints.getRecipes.initiate(undefined, REFRESH)).unwrap(),
    dispatch(recipeEndpoints.getRecipeGroups.initiate(undefined, REFRESH)).unwrap(),
  ]);
  const thisWeek = startOfWeek(new XDate());
  await Promise.all(SYNCED_WEEKS.map((offset) =>
    dispatch(weekplanEndpoints.getWeekplanWeek.initiate(toDayKey(addWeeks(thisWeek, offset)), REFRESH)).unwrap()));
  if (instance.householdsEnabled) {
    await dispatch(householdEndpoints.getHouseholds.initiate(undefined, REFRESH)).unwrap();
  }
  await dispatch(nutritionEndpoints.getNutrition.initiate(undefined, REFRESH)).unwrap();
  dispatch(synced());
  await prefetchThumbnails(recipes, () => selectLoggedIn(getState()));
};

let running: Promise<void> | null = null;

/**
 * Downloads what the app needs offline. Stops at the first failure and starts over next time.
 *
 * @return {Function} the thunk, resolving once the sync is over
 */
export const syncForOffline = () => (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
  // Only one tab syncs; the others would fetch the same data into the same storage.
  running ??= withTabLock('cookpal-sync', () => syncEverything(dispatch, getState), {ifAvailable: true})
      // Only the code: a failed download is an AxiosError, and its config carries the Authorization header.
      .catch((error) => console.info('Sync for offline use stopped', toApiError(error).code))
      .finally(() => {
        running = null;
      });
  return running;
};
