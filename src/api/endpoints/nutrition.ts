import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {queryString} from '../queryString';
import {CatalogueFood, NutritionOfRecipe, RecipeNutrition} from '../types/nutrition';

// A correction changes the lines and the summary the recipe carries.
const NUTRITION_CHANGED = ['Nutrition', 'Recipe'] as const;

const nutritionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Every readable recipe's nutrition, by recipe id.
    getNutrition: builder.query<Record<number, RecipeNutrition>, void>({
      query: () => ({url: '/recipes/nutrition'}),
      transformResponse: (sheets: NutritionOfRecipe[]) =>
        Object.fromEntries(sheets.map((sheet) => [sheet.recipeId, sheet.nutrition])),
      providesTags: ['Nutrition'],
    }),
    searchCatalogue: builder.query<CatalogueFood[], string>({
      query: (text) => ({url: '/catalogue/search' + queryString({q: text})}),
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    // Without a food the ingredient counts for nothing.
    linkIngredient: builder.mutation<void, {ingredientId: number, catalogueFoodId: number | null}>({
      query: ({ingredientId, catalogueFoodId}) => ({url: `/ingredients/${ingredientId}/link`, method: 'PUT',
        body: catalogueFoodId === null ? {excluded: true} : {catalogueFoodId}}),
      invalidatesTags: [...NUTRITION_CHANGED],
    }),
    // The unit as the recipe writes it; empty for pieces.
    setOwnPortion: builder.mutation<void, {ingredientId: number, unit: string, grams: number}>({
      query: ({ingredientId, unit, grams}) => ({url: `/ingredients/${ingredientId}/portion`, method: 'PUT',
        body: {unit, grams}}),
      invalidatesTags: [...NUTRITION_CHANGED],
    }),
    removeOwnPortion: builder.mutation<void, {ingredientId: number, unit: string}>({
      query: ({ingredientId, unit}) => ({url: `/ingredients/${ingredientId}/portion` + queryString({unit}),
        method: 'DELETE'}),
      invalidatesTags: [...NUTRITION_CHANGED],
    }),
  }),
});

export const {
  useGetNutritionQuery,
  useSearchCatalogueQuery,
  useLinkIngredientMutation,
  useSetOwnPortionMutation,
  useRemoveOwnPortionMutation,
} = nutritionApi;

export const nutritionEndpoints = nutritionApi.endpoints;

export const useRecipeNutrition = (recipeId: number) =>
  useGetNutritionQuery(undefined, {selectFromResult: (result) => ({...result, data: result.data?.[recipeId]})});
