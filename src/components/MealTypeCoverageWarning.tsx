import React from 'react';
import {useTranslation} from 'react-i18next';
import {mealTypeCoverage, warrantsMealTypeWarning} from '../helper/mealTypeCoverage';
import {useAppSelector} from '../redux/hooks';
import {Notice} from './Notice';

// Says so when too many recipes do not name their meals, because then the meal filters and ranking
// can only guess. Shows nothing otherwise.
export const MealTypeCoverageWarning = () => {
  const {t} = useTranslation('translation');
  const recipes = useAppSelector((state) => state.recipes.recipes);
  const coverage = mealTypeCoverage(recipes);
  if (!warrantsMealTypeWarning(coverage)) {
    return null;
  }
  return <Notice icon="alert-outline" tone="warning">{t('common.mealTypeCoverageWarning', {...coverage})}</Notice>;
};
