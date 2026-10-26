import {skipToken} from '@reduxjs/toolkit/query';
import {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {api} from '../../api/api';
import {
  useGetShoppingRegularsQuery, useNotNowMutation, useSetRegularMutedMutation,
} from '../../api/endpoints/shopping';
import {ShoppingItem, ShoppingList, ShoppingRegular} from '../../api/types/shopping';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {ItemMap} from '../../helper/shopping/listItems';
import {nameKey} from '../../helper/shopping/names';
import {suggestedNow} from '../../helper/shopping/suggestions';
import {useShoppingSettings} from '../../helper/shopping/useShoppingSettings';
import {useNow} from '../../helper/useNow';
import {useAppDispatch} from '../../redux/hooks';

/** A suggestion's window can open while the list stays on screen. */
const CLOCK_MILLIS = 60_000;

// What the list buys regularly and is due again now, and the answers that need the server.
export const useSuggestions = (list: ShoppingList | undefined, items: ItemMap, bought: ShoppingItem[]) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const {suggestions: shown} = useShoppingSettings();
  const {data: regulars} = useGetShoppingRegularsQuery(shown && list ? list : skipToken);
  const [notNow] = useNotNowMutation();
  const [setRegularMuted] = useSetRegularMutedMutation();
  const now = useNow(CLOCK_MILLIS);

  const suggested = useMemo(
      () => regulars ? suggestedNow(regulars, Object.values(items), now) : [], [regulars, items, now]);
  // A suggested name moved up out of recently bought, as it does when it goes on the list.
  const recentlyBought = useMemo(() => {
    const suggestedNames = new Set(suggested.map((regular) => nameKey(regular.name)));
    return bought.filter((item) => !suggestedNames.has(nameKey(item.name)));
  }, [bought, suggested]);

  const failed = (error: unknown) => SnackbarUtil.show({message: t(errorMessageKey(error))});

  const putOff = (regular: ShoppingRegular) => list && notNow({list, regular}).unwrap().catch(failed);

  const neverSuggest = (regular: ShoppingRegular) => list &&
    setRegularMuted({list, regular, muted: true}).unwrap()
        .then(() => SnackbarUtil.show({message: t('screens.shopping.suggestions.neverDone', {name: regular.name})}))
        .catch(failed);

  const listId = list?.id;
  const reload = useCallback(() => {
    if (listId !== undefined) {
      dispatch(api.util.invalidateTags([{type: 'ShoppingRegular', id: listId}]));
    }
  }, [listId]);

  return {suggested, recentlyBought, putOff, neverSuggest, reload};
};
