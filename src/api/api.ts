import {UnknownAction} from '@reduxjs/toolkit';
import {createApi} from '@reduxjs/toolkit/query/react';
import {REHYDRATE, RehydrateAction} from 'redux-persist';
import {baseQuery} from './baseQuery';

// Longer than any gap between two syncs; RTK Query caps its timers at about 24 days anyway.
const KEEP_FOR_OFFLINE_SECONDS = 30 * 24 * 60 * 60;

/** For lookups only wanted once, which are not worth keeping on the device. */
export const KEEP_BRIEFLY_SECONDS = 60;

const isRehydrationOf = (action: UnknownAction, key: string): action is UnknownAction & RehydrateAction =>
  action.type === REHYDRATE && action.key === key;

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['UserInfo', 'InstanceInfo', 'Recipe', 'RecipeGroup', 'Nutrition', 'Weekplan', 'Household',
    'HouseholdInvite', 'PlanningProfile', 'ApiKey', 'Share', 'Ingredient', 'Staple'],
  keepUnusedDataFor: KEEP_FOR_OFFLINE_SECONDS,
  // An opened screen shows what is cached at once and refreshes it once that is a minute old.
  refetchOnMountOrArgChange: 60,
  refetchOnReconnect: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractRehydrationInfo(action, {reducerPath}): any {
    if (isRehydrationOf(action, reducerPath)) {
      return action.payload;
    }
  },
  endpoints: () => ({}),
});
