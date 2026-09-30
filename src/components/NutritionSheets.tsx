import React from 'react';
import {useRecipeNutrition} from '../api/endpoints/nutrition';
import {useGetSharedRecipeNutritionQuery} from '../api/endpoints/sharing';
import {NutritionSheet, NutritionSheetProps} from './NutritionSheet';

// A recipe the account can read: its lines come with the nutrition of every such recipe.
export const RecipeNutritionSheet = (props: NutritionSheetProps & {recipeId: number}) => {
  const {data, error, refetch} = useRecipeNutrition(props.recipeId);
  return <NutritionSheet {...props} details={data} error={error} onRetry={refetch} />;
};

// A recipe read through a share link: read when the sheet opens.
export const SharedNutritionSheet = (props: NutritionSheetProps & {shareId: string}) => {
  const {data, error, refetch} = useGetSharedRecipeNutritionQuery(props.shareId);
  return <NutritionSheet {...props} details={data} error={error} onRetry={refetch} />;
};
