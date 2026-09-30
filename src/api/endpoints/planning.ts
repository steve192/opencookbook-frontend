import {api} from '../api';
import {householdScope} from '../queryString';
import {PlanDraft, PlanningProfile, RerollReason} from '../types/planning';

/** Your own plan when the household is null. */
export interface DraftRef {
  draftId: number;
  householdId: string | null;
}

/** Days the cook is away get nothing planned. */
interface DraftRequest {
  profileId: number;
  startDate: string;
  days: number;
  skippedDates: string[];
  householdId: string | null;
}

const draftUrl = ({draftId, householdId}: DraftRef, action = '') =>
  `/planning/drafts/${draftId}${action}${householdScope(householdId)}`;

const planningApi = api.injectEndpoints({
  endpoints: (builder) => {
    // Every change answers with the whole week, which takes the place of the cached one.
    const draftChange = <Arg extends DraftRef>(request: (arg: Arg) => {url: string, body: unknown}) =>
      builder.mutation<PlanDraft, Arg>({
        query: (arg) => ({...request(arg), method: 'POST'}),
        onQueryStarted: ({draftId, householdId}, {dispatch, queryFulfilled}) => {
          queryFulfilled.then(({data}) => dispatch(planningApi.util.upsertQueryData('getPlanDraft',
              {draftId, householdId}, data)), () => undefined);
        },
      });
    return {
      getPlanningProfiles: builder.query<PlanningProfile[], string | null>({
        query: (householdId) => ({url: '/planning/profiles' + householdScope(householdId)}),
        providesTags: ['PlanningProfile'],
      }),
      // Created when it has no id, changed otherwise.
      savePlanningProfile: builder.mutation<PlanningProfile, {profile: PlanningProfile, householdId: string | null}>({
        query: ({profile, householdId}) => profile.id === undefined ?
          {url: '/planning/profiles' + householdScope(householdId), method: 'POST', body: profile} :
          {url: `/planning/profiles/${profile.id}${householdScope(householdId)}`, method: 'PUT', body: profile},
        invalidatesTags: ['PlanningProfile'],
      }),
      generatePlanDraft: builder.mutation<PlanDraft, DraftRequest>({
        query: ({householdId, ...request}) => ({url: '/planning/drafts' + householdScope(householdId), method: 'POST',
          body: request}),
      }),
      getPlanDraft: builder.query<PlanDraft, DraftRef>({
        query: (draft) => ({url: draftUrl(draft)}),
      }),
      // Something else for one meal, never the recipe it had; the reason steers the replacement.
      rerollPlanSlot: draftChange((arg: DraftRef & {slotId: number, reason?: RerollReason}) =>
        ({url: draftUrl(arg, `/slots/${arg.slotId}/reroll`), body: {reason: arg.reason}})),
      setPlanSlotLocked: draftChange((arg: DraftRef & {slotId: number, locked: boolean}) =>
        ({url: draftUrl(arg, `/slots/${arg.slotId}/lock`), body: {locked: arg.locked}})),
      togglePlanSlotGap: draftChange((arg: DraftRef & {slotId: number}) =>
        ({url: draftUrl(arg, `/slots/${arg.slotId}/toggle-gap`), body: {}})),
      // A new draw for every meal that is not locked.
      rerollPlanDraft: draftChange((arg: DraftRef) => ({url: draftUrl(arg, '/reroll'), body: {}})),
      // Adds the week's meals to the weekplan; meals planned by hand stay.
      acceptPlanDraft: builder.mutation<PlanDraft, DraftRef>({
        query: (draft) => ({url: draftUrl(draft, '/accept'), method: 'POST', body: {}}),
        invalidatesTags: ['Weekplan'],
      }),
      discardPlanDraft: builder.mutation<void, DraftRef>({
        query: (draft) => ({url: draftUrl(draft), method: 'DELETE'}),
      }),
    };
  },
});

export const {
  useGetPlanningProfilesQuery,
  useSavePlanningProfileMutation,
  useGeneratePlanDraftMutation,
  useGetPlanDraftQuery,
  useRerollPlanSlotMutation,
  useSetPlanSlotLockedMutation,
  useTogglePlanSlotGapMutation,
  useRerollPlanDraftMutation,
  useAcceptPlanDraftMutation,
  useDiscardPlanDraftMutation,
} = planningApi;
