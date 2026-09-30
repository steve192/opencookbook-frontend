import {useGetUserInfoQuery} from '../../api/endpoints/account';

/**
 * Whether the signed in account has been through the first-run screen. Unreachable counts as yes,
 * so an offline start is not held at a screen it cannot get past.
 *
 * @return {boolean | undefined} the answer, undefined only during the first load
 */
export const useOnboarding = (): boolean | undefined => {
  // isLoading stays false while a failed load is retried, so the answer does not flip back.
  const {data, isLoading} = useGetUserInfoQuery();
  if (data) {
    return data.onboarded !== false;
  }
  return isLoading ? undefined : true;
};
