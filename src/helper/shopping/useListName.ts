import {useTranslation} from 'react-i18next';
import {ShoppingList} from '../../api/types/shopping';
import {listName} from './lists';

/**
 * What lists are called in the app's language.
 *
 * @return {Function} the name to show for a list
 */
export const useListName = (): (list: ShoppingList) => string => {
  const {t} = useTranslation('translation');
  const myList = t('screens.shopping.myList');
  return (list) => listName(list, myList);
};
