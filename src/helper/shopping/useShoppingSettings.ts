import {useGetUserInfoQuery, useSetShoppingSettingsMutation} from '../../api/endpoints/account';
import {ShoppingProvider} from '../../api/types/shopping';

/**
 * Where shopping imports go, and whether regularly bought items are suggested.
 *
 * @return {object} the provider, undefined while unknown and null while never chosen; whether suggestions are shown;
 *     and ways to change both
 */
export const useShoppingSettings = () => {
  const {data: userInfo} = useGetUserInfoQuery();
  const [setShoppingSettings] = useSetShoppingSettingsMutation();
  const provider = userInfo === undefined ? undefined : userInfo.shoppingProvider ?? null;
  const chooseProvider = async (chosen: ShoppingProvider) => {
    await setShoppingSettings({provider: chosen}).unwrap();
  };
  const showSuggestions = async (shown: boolean) => {
    await setShoppingSettings({suggestions: shown}).unwrap();
  };
  return {provider, suggestions: userInfo?.shoppingSuggestions ?? true, chooseProvider, showSuggestions};
};
