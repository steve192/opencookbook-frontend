import {useCallback, useEffect} from 'react';
import RestAPI, {ShoppingProvider} from '../../dao/RestAPI';
import {changeShoppingProvider} from '../../redux/features/settingsSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';

/**
 * Where shopping imports go. Read from the account once when not known yet, which is the case
 * after signing in on the login screen rather than through the splash screen.
 *
 * @return {object} the provider, undefined while unknown and null while never chosen, and a way to choose
 */
export const useShoppingProvider = () => {
  const provider = useAppSelector((state) => state.settings.shoppingProvider);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (provider === undefined) {
      RestAPI.getUserInfo()
          .then((userInfo) => dispatch(changeShoppingProvider(userInfo.shoppingProvider ?? null)))
          .catch(() => undefined);
    }
  }, [provider]);

  const choose = useCallback(async (chosen: ShoppingProvider) => {
    await RestAPI.setShoppingProvider(chosen);
    dispatch(changeShoppingProvider(chosen));
  }, []);

  return {provider, choose};
};
