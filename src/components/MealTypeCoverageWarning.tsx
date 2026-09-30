import React from 'react';
import {useTranslation} from 'react-i18next';
import {mealTypeCoverage, warrantsMealTypeWarning} from '../helper/mealTypeCoverage';
import {useOwnRecipes} from '../api/endpoints/recipes';
import {Notice} from './Notice';

// Says so when too many recipes do not name their meals, because then the meal filters and ranking
// can only guess. Shows nothing otherwise.
export const MealTypeCoverageWarning = () => {
  const {t} = useTranslation('translation');
  const coverage = mealTypeCoverage(useOwnRecipes().data ?? []);
  if (!warrantsMealTypeWarning(coverage)) {
    return null;
  }
  return <Notice icon="alert-outline" tone="warning">{t('common.mealTypeCoverageWarning', {...coverage})}</Notice>;
};
