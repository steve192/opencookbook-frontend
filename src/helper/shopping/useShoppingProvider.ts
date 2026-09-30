import {useGetUserInfoQuery, useSetShoppingProviderMutation} from '../../api/endpoints/account';
import {ShoppingProvider} from '../../api/types/shopping';

/**
 * Where shopping imports go.
 *
 * @return {object} the provider, undefined while unknown and null while never chosen, and a way to choose
 */
export const useShoppingProvider = () => {
  const {data: userInfo} = useGetUserInfoQuery();
  const [setShoppingProvider] = useSetShoppingProviderMutation();
  const provider = userInfo === undefined ? undefined : userInfo.shoppingProvider ?? null;
  const choose = async (chosen: ShoppingProvider) => {
    await setShoppingProvider(chosen).unwrap();
  };
  return {provider, choose};
};
