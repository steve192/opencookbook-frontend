import {createSelector} from '@reduxjs/toolkit';
import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {UPLOAD_TIMEOUT_MILLIS} from '../client';
import {queryString} from '../queryString';
import {ownRecipesOf, recipeInListing, recipesShownIn} from '../recipeSelection';
import {imageForm, uploadRequest} from '../upload';
import {RecipeSuggestionRequest, RecipeSuggestions} from '../types/planning';
import {Ingredient, Recipe, RecipeDeletionImpact, RecipeDiet, RecipeGroup} from '../types/recipes';

export const asRecipe = (recipe: Recipe): Recipe => ({...recipe, type: 'Recipe'});
const asRecipeGroup = (group: RecipeGroup): RecipeGroup => ({...group, type: 'RecipeGroup'});

// What a changed recipe shows up in besides the listing.
export const RECIPE_CHANGED = ['Recipe', 'Nutrition', 'Ingredient', 'Weekplan'] as const;

const recipesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Every recipe the account can read: its own and those its households show.
    getRecipes: builder.query<Recipe[], void>({
      query: () => ({url: '/recipes'}),
      transformResponse: (recipes: Recipe[]) => recipes.map(asRecipe),
      providesTags: ['Recipe'],
    }),
    createRecipe: builder.mutation<Recipe, Recipe>({
      query: (recipe) => ({url: '/recipes', method: 'POST', body: recipe}),
      transformResponse: asRecipe,
      invalidatesTags: [...RECIPE_CHANGED],
    }),
    updateRecipe: builder.mutation<Recipe, Recipe>({
      query: (recipe) => ({url: `/recipes/${recipe.id}`, method: 'PUT', body: recipe}),
      transformResponse: asRecipe,
      invalidatesTags: [...RECIPE_CHANGED],
    }),
    deleteRecipe: builder.mutation<void, number>({
      query: (recipeId) => ({url: `/recipes/${recipeId}`, method: 'DELETE'}),
      invalidatesTags: [...RECIPE_CHANGED],
    }),
    // Reads a recipe website and saves what it found as a new recipe.
    importRecipe: builder.mutation<Recipe, string>({
      query: (importUrl) => ({url: '/recipes/import' + queryString({importUrl}), timeout: UPLOAD_TIMEOUT_MILLIS}),
      transformResponse: asRecipe,
      invalidatesTags: [...RECIPE_CHANGED],
    }),
    // Copies a recipe somebody else owns into your own cookbook.
    saveRecipeCopy: builder.mutation<Recipe, number>({
      query: (recipeId) => ({url: `/recipes/${recipeId}/import`, method: 'POST', body: {}}),
      transformResponse: asRecipe,
      invalidatesTags: [...RECIPE_CHANGED],
    }),
    getRecipeDeletionImpact: builder.query<RecipeDeletionImpact, number>({
      query: (recipeId) => ({url: `/recipes/${recipeId}/impact`}),
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    getAvailableImportHosts: builder.query<string[], void>({
      query: () => ({url: '/recipes/import/available-hosts'}),
    }),
    // The diet these ingredients would give a recipe; nothing is stored.
    previewDiet: builder.mutation<RecipeDiet | null, string[]>({
      query: (ingredientNames) => ({url: '/recipes/diet-preview', method: 'POST', body: {ingredientNames}}),
      transformResponse: (response: {diet?: RecipeDiet | null}) => response.diet ?? null,
    }),
    suggestRecipes: builder.mutation<RecipeSuggestions, RecipeSuggestionRequest>({
      query: (request) => ({url: '/recipes/suggestions', method: 'POST', body: request}),
    }),
    getIngredients: builder.query<Ingredient[], void>({
      query: () => ({url: '/ingredients'}),
      providesTags: ['Ingredient'],
    }),
    getRecipeGroups: builder.query<RecipeGroup[], void>({
      query: () => ({url: '/recipe-groups'}),
      transformResponse: (groups: RecipeGroup[]) => groups.map(asRecipeGroup),
      providesTags: ['RecipeGroup'],
    }),
    createRecipeGroup: builder.mutation<RecipeGroup, RecipeGroup>({
      query: (group) => ({url: '/recipe-groups', method: 'POST', body: group}),
      transformResponse: asRecipeGroup,
      invalidatesTags: ['RecipeGroup'],
    }),
    updateRecipeGroup: builder.mutation<RecipeGroup, RecipeGroup>({
      query: (group) => ({url: `/recipe-groups/${group.id}`, method: 'PUT', body: group}),
      transformResponse: asRecipeGroup,
      invalidatesTags: ['RecipeGroup', 'Recipe'],
    }),
    deleteRecipeGroup: builder.mutation<void, number>({
      query: (groupId) => ({url: `/recipe-groups/${groupId}`, method: 'DELETE'}),
      invalidatesTags: ['RecipeGroup', 'Recipe'],
    }),
    // Resolves to the uuid the recipe refers to the image by.
    uploadImage: builder.mutation<string, string>({
      queryFn: async (uri, _api, _extra, baseQuery) => {
        const result = await baseQuery(uploadRequest('/recipes-images', await imageForm('image', uri)));
        return result.error ? {error: result.error} : {data: (result.data as {uuid: string}).uuid};
      },
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useImportRecipeMutation,
  useSaveRecipeCopyMutation,
  useLazyGetRecipeDeletionImpactQuery,
  useGetAvailableImportHostsQuery,
  usePreviewDietMutation,
  useSuggestRecipesMutation,
  useGetIngredientsQuery,
  useGetRecipeGroupsQuery,
  useCreateRecipeGroupMutation,
  useUpdateRecipeGroupMutation,
  useDeleteRecipeGroupMutation,
  useUploadImageMutation,
} = recipesApi;

export const recipeEndpoints = recipesApi.endpoints;

const selectCookbook = createSelector(
    [(recipes: Recipe[] | undefined) => recipes, (_recipes: Recipe[] | undefined, householdId?: string) => householdId],
    (recipes, householdId) =>
      recipes && (householdId === undefined ? ownRecipesOf(recipes) : recipesShownIn(recipes, householdId)));

// Your own cookbook, or the one a household shows.
export const useCookbookRecipes = (householdId?: string) =>
  useGetRecipesQuery(undefined,
      {selectFromResult: (result) => ({...result, data: selectCookbook(result.data, householdId)})});

export const useOwnRecipes = () => useCookbookRecipes();

// Every readable recipe is in the listing, so a recipe is found there or not at all.
export const useRecipe = (recipeId: number) =>
  useGetRecipesQuery(undefined, {selectFromResult: (result) => {
    const {recipe, notFound} = recipeInListing(result.data, result.isFetching, recipeId);
    return {...result, data: recipe, notFound};
  }});
