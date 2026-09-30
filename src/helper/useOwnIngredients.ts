import {useMemo} from 'react';
import {useGetIngredientsQuery} from '../api/endpoints/recipes';
import {OwnIngredient, ownIngredients} from './ownIngredients';

/**
 * @return {OwnIngredient[]} the cook's own ingredients, empty until loaded or when loading failed
 */
export const useOwnIngredients = (): OwnIngredient[] => {
  const {data} = useGetIngredientsQuery();
  return useMemo(() => ownIngredients(data ?? []), [data]);
};
