import {useOwnRecipes} from '../../api/endpoints/recipes';

// How many recipes of your own the share switch would share.
export const useOwnRecipeCount = (): number => useOwnRecipes().data?.length ?? 0;
