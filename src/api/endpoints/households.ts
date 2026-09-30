import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {Household, HouseholdInvite} from '../types/households';

// Who is in a household decides which recipes, nutrition and plans the account can read.
const MEMBERSHIP_CHANGED = ['Household', 'Recipe', 'Nutrition', 'Weekplan'] as const;

const householdsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholds: builder.query<Household[], void>({
      query: () => ({url: '/households'}),
      providesTags: ['Household'],
    }),
    // With its members.
    getHousehold: builder.query<Household, string>({
      query: (householdId) => ({url: `/households/${householdId}`}),
      providesTags: ['Household'],
    }),
    createHousehold: builder.mutation<Household, {name: string, shareRecipes: boolean}>({
      query: (household) => ({url: '/households', method: 'POST', body: household}),
      invalidatesTags: [...MEMBERSHIP_CHANGED],
    }),
    renameHousehold: builder.mutation<Household, {householdId: string, name: string}>({
      query: ({householdId, name}) => ({url: `/households/${householdId}`, method: 'PUT', body: {name}}),
      invalidatesTags: ['Household'],
    }),
    // Puts your whole cookbook into a household, or takes it back out.
    setHouseholdSharing: builder.mutation<Household, {householdId: string, shareRecipes: boolean}>({
      query: ({householdId, shareRecipes}) => ({url: `/households/${householdId}/sharing`, method: 'PUT',
        body: {shareRecipes}}),
      invalidatesTags: [...MEMBERSHIP_CHANGED],
    }),
    // Leaves a household, or removes somebody else.
    removeHouseholdMember: builder.mutation<void, {householdId: string, memberUserId: number}>({
      query: ({householdId, memberUserId}) => ({url: `/households/${householdId}/members/${memberUserId}`,
        method: 'DELETE'}),
      invalidatesTags: [...MEMBERSHIP_CHANGED],
    }),
    getHouseholdInvites: builder.query<HouseholdInvite[], string>({
      query: (householdId) => ({url: `/households/${householdId}/invites`}),
      providesTags: ['HouseholdInvite'],
    }),
    createHouseholdInvite: builder.mutation<HouseholdInvite, string>({
      query: (householdId) => ({url: `/households/${householdId}/invites`, method: 'POST', body: {}}),
      invalidatesTags: ['HouseholdInvite'],
    }),
    revokeHouseholdInvite: builder.mutation<void, {householdId: string, inviteId: string}>({
      query: ({householdId, inviteId}) => ({url: `/households/${householdId}/invites/${inviteId}`, method: 'DELETE'}),
      invalidatesTags: ['HouseholdInvite'],
    }),
    // What an invite leads to: the household's name, and nothing else.
    previewHouseholdInvite: builder.query<string, string>({
      query: (token) => ({url: `/household-invites/${token}`}),
      transformResponse: (preview: {householdName: string}) => preview.householdName,
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    acceptHouseholdInvite: builder.mutation<Household, {token: string, shareRecipes: boolean}>({
      query: ({token, shareRecipes}) => ({url: `/household-invites/${token}/accept`, method: 'POST',
        body: {shareRecipes}}),
      invalidatesTags: [...MEMBERSHIP_CHANGED],
    }),
  }),
});

export const {
  useGetHouseholdsQuery,
  useGetHouseholdQuery,
  useCreateHouseholdMutation,
  useRenameHouseholdMutation,
  useSetHouseholdSharingMutation,
  useRemoveHouseholdMemberMutation,
  useGetHouseholdInvitesQuery,
  useCreateHouseholdInviteMutation,
  useRevokeHouseholdInviteMutation,
  usePreviewHouseholdInviteQuery,
  useAcceptHouseholdInviteMutation,
} = householdsApi;

export const householdEndpoints = householdsApi.endpoints;
