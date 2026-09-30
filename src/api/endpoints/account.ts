import {OpenSourceSection} from '../../legal/openSourceComponents';
import {api} from '../api';
import {ApiError} from '../ApiError';
import {queryString} from '../queryString';
import {IssuedTokens, storeTokens} from '../session';
import {ApiKey, ApiScope, InstanceInfo, IssuedApiKey, UserInfo} from '../types/account';
import {ShoppingProvider} from '../types/shopping';

// Tokens are stored before the call resolves, so whatever the caller does next is signed in.
const signedIn = async (result: {data?: unknown, error?: ApiError}): Promise<{data: void} | {error: ApiError}> => {
  if (result.error) {
    return {error: result.error};
  }
  await storeTokens(result.data as IssuedTokens);
  return {data: undefined};
};

const accountApi = api.injectEndpoints({
  endpoints: (builder) => {
    // Every change answers with the account as it now stands, which replaces the cached one.
    const accountChange = <Arg, >(request: (arg: Arg) => {url: string, method: 'PUT' | 'POST', body: unknown}) =>
      builder.mutation<UserInfo, Arg>({
        query: request,
        onQueryStarted: (_arg, {dispatch, queryFulfilled}) => {
          queryFulfilled.then(({data}) => dispatch(accountApi.util.upsertQueryData('getUserInfo', undefined, data)),
              () => undefined);
        },
      });
    return {
      getUserInfo: builder.query<UserInfo, void>({
        query: () => ({url: '/users/self'}),
        providesTags: ['UserInfo'],
      }),
      getInstanceInfo: builder.query<InstanceInfo, void>({
        query: () => ({url: '/instance', anonymous: true}),
        providesTags: ['InstanceInfo'],
      }),
      signIn: builder.mutation<void, {emailAddress: string, password: string}>({
        queryFn: async (credentials, _api, _extra, baseQuery) =>
          signedIn(await baseQuery({url: '/users/login', method: 'POST', body: credentials, anonymous: true})),
      }),
      activateAccount: builder.mutation<void, string>({
        queryFn: async (activationId, _api, _extra, baseQuery) =>
          signedIn(await baseQuery({url: '/users/activate' + queryString({activationId}),
            anonymous: true})),
      }),
      signUp: builder.mutation<void, {emailAddress: string, password: string}>({
        query: (credentials) => ({url: '/users/signup', method: 'POST', body: credentials, anonymous: true}),
      }),
      requestPasswordReset: builder.mutation<void, string>({
        query: (emailAddress) => ({url: '/users/requestPasswordReset', method: 'POST', body: {emailAddress},
          anonymous: true}),
      }),
      resetPassword: builder.mutation<void, {passwordResetId: string, newPassword: string}>({
        query: (reset) => ({url: '/users/resetPassword', method: 'POST', body: reset, anonymous: true}),
      }),
      // The name fellow household members see; blank clears it.
      setDisplayName: accountChange((displayName: string) =>
        ({url: '/users/self/displayName', method: 'PUT', body: {displayName}})),
      completeOnboarding: accountChange((displayName: string) =>
        ({url: '/users/self/onboarding', method: 'POST', body: {displayName}})),
      setShoppingProvider: accountChange((provider: ShoppingProvider) =>
        ({url: '/users/self/shoppingProvider', method: 'PUT', body: {provider}})),
      deleteAccount: builder.mutation<void, void>({
        query: () => ({url: '/users/self', method: 'DELETE'}),
      }),
      getApiKeys: builder.query<ApiKey[], void>({
        query: () => ({url: '/api-keys'}),
        providesTags: ['ApiKey'],
      }),
      createApiKey: builder.mutation<IssuedApiKey, {name: string, scopes: ApiScope[]}>({
        query: (key) => ({url: '/api-keys', method: 'POST', body: key}),
        invalidatesTags: ['ApiKey'],
      }),
      revokeApiKey: builder.mutation<void, number>({
        query: (id) => ({url: `/api-keys/${id}`, method: 'DELETE'}),
        invalidatesTags: ['ApiKey'],
      }),
      getOpenSourceSections: builder.query<OpenSourceSection[], void>({
        query: () => ({url: '/open-source-components'}),
        transformResponse: (response: {sections: OpenSourceSection[]}) => response.sections,
      }),
    };
  },
});

export const {
  useGetUserInfoQuery,
  useGetInstanceInfoQuery,
  useSignInMutation,
  useActivateAccountMutation,
  useSignUpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useSetDisplayNameMutation,
  useCompleteOnboardingMutation,
  useSetShoppingProviderMutation,
  useDeleteAccountMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useGetOpenSourceSectionsQuery,
} = accountApi;

export const accountEndpoints = accountApi.endpoints;
