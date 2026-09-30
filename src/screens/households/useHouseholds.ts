import {useGetHouseholdsQuery} from '../../api/endpoints/households';
import {Household} from '../../api/types/households';
import {useInstanceFeatures} from '../../helper/useInstanceFeatures';

const NONE: Household[] = [];

/**
 * The signed in account's households. Empty without households.
 *
 * @return {object} the list, and whether it is still loading
 */
export const useHouseholds = () => {
  const {householdsEnabled} = useInstanceFeatures();
  const {data, isLoading} = useGetHouseholdsQuery(undefined, {skip: !householdsEnabled});
  return {households: data ?? NONE, loading: isLoading};
};
