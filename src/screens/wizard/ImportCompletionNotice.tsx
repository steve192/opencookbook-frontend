import React from 'react';
import {useTranslation} from 'react-i18next';
import {Notice} from '../../components/Notice';
import {MissingDetail} from '../../helper/recipeCompleteness';

const LABEL_KEYS = {
  servings: 'screens.editRecipe.servings',
  time: 'screens.editRecipe.totalTimeField',
  suits: 'screens.editRecipe.suits',
  diet: 'screens.editRecipe.diet',
} as const;

// After an import or scan: what the source did not say, so the cook completes it before saving.
// It shrinks as they fill it in, and is gone once nothing is missing.
export const ImportCompletionNotice = (props: {missing: MissingDetail[]}) => {
  const {t} = useTranslation('translation');
  if (props.missing.length === 0) {
    return null;
  }
  const missing = props.missing.map((detail) => t(LABEL_KEYS[detail])).join(', ');
  return <Notice icon="clipboard-edit-outline" tone="information">{t('screens.editRecipe.completeImport', {missing})}</Notice>;
};
