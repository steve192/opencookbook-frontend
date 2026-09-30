import {api} from '../api';
import {queryString} from '../queryString';
import {NutritionSummary, RecipeNutrition} from '../types/nutrition';
import {IngredientUse, Recipe, RecipeDiet, RecipeImage} from '../types/recipes';
import {RecipeShare} from '../types/sharing';
import {asRecipe, RECIPE_CHANGED} from './recipes';

/** No ids, no owner and no groups: none of that is a link recipient's business. */
interface SharedRecipeResponse {
  title: string;
  neededIngredients: IngredientUse[];
  preparationSteps: string[];
  images: RecipeImage[];
  servings: number;
  preparationTime?: number | null;
  totalTime?: number | null;
  recipeType?: RecipeDiet | null;
  recipeSource?: string;
  nutrition?: NutritionSummary | null;
}

// Without an id and groups a shared recipe cannot be edited or planned by accident.
const sharedRecipeToRecipe = (shared: SharedRecipeResponse): Recipe => ({
  title: shared.title,
  neededIngredients: shared.neededIngredients,
  preparationSteps: shared.preparationSteps,
  images: shared.images,
  servings: shared.servings,
  recipeGroups: [],
  type: 'Recipe',
  recipeSource: shared.recipeSource,
  preparationTime: shared.preparationTime,
  totalTime: shared.totalTime,
  recipeType: shared.recipeType,
  nutrition: shared.nutrition,
});

const sharingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // The public links of one of your recipes; empty when it is not shared.
    getSharesOfRecipe: builder.query<RecipeShare[], number>({
      query: (recipeId) => ({url: '/shares' + queryString({recipeId})}),
      providesTags: ['Share'],
    }),
    // Shares a recipe publicly, or returns the link it already has.
    shareRecipe: builder.mutation<RecipeShare, number>({
      query: (recipeId) => ({url: '/shares', method: 'POST', body: {recipeId}}),
      invalidatesTags: ['Share'],
    }),
    revokeShare: builder.mutation<void, string>({
      query: (shareId) => ({url: `/shares/${shareId}`, method: 'DELETE'}),
      invalidatesTags: ['Share'],
    }),
    // Read the way people without an account read it, from this app's own server.
    getSharedRecipe: builder.query<Recipe, string>({
      query: (shareId) => ({url: `/shared/${shareId}`, anonymous: true}),
      transformResponse: sharedRecipeToRecipe,
    }),
    getSharedRecipeNutrition: builder.query<RecipeNutrition, string>({
      query: (shareId) => ({url: `/shared/${shareId}/nutrition`, anonymous: true}),
    }),
    importSharedRecipe: builder.mutation<Recipe, string>({
      query: (shareId) => ({url: `/shares/${shareId}/import`, method: 'POST', body: {}}),
      transformResponse: asRecipe,
      invalidatesTags: [...RECIPE_CHANGED],
    }),
  }),
});

export const {
  useGetSharesOfRecipeQuery,
  useShareRecipeMutation,
  useRevokeShareMutation,
  useGetSharedRecipeQuery,
  useGetSharedRecipeNutritionQuery,
  useImportSharedRecipeMutation,
} = sharingApi;
