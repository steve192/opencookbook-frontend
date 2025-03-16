import React from 'react';
import RecipeListScreen from '../../../screens/RecipeListScreen';
import { useLocalSearchParams } from 'expo-router';


export default function Main() {
  const {shownRecipeGroupId} = useLocalSearchParams<'/(main)/(overview)'>();
  return <RecipeListScreen />;
}
