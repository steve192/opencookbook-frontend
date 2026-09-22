import {useEffect} from 'react';
import {fetchMyRecipes, ownRecipes} from '../../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';

/**
 * How many recipes of your own the share switch would share. Loads them itself for invite deep links.
 *
 * @return {number} the size of your own cookbook
 */
export const useOwnRecipeCount = (): number => {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => ownRecipes(state.recipes.recipes).length);

  useEffect(() => {
    dispatch(fetchMyRecipes());
  }, [dispatch]);

  return count;
};
