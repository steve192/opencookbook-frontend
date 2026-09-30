import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectionPopup} from '../../components/SelectionPopup';
import {Option} from '../../components/SelectionPopupModal';
import {useGetRecipeGroupsQuery} from '../../api/endpoints/recipes';
import {RecipeGroup} from '../../api/types/recipes';
import {findRecipeGroupByOption, toRecipeGroupOptions} from '../../helper/recipeGroups';


interface Props {
    recipeGroup?: RecipeGroup
    onRecipeGroupChange: (newIngredient: RecipeGroup | undefined) => void
}

export const RecipeGroupFormField = (props: Props) => {
  const availableGroups = useGetRecipeGroupsQuery().data ?? [];

  const {t} = useTranslation('translation');

  const setRecipeGroup = (option: Option) => {
    if (option.newlyCreated) {
      // Newly created
      props.onRecipeGroupChange({title: option.value, type: 'RecipeGroup'});
    } else {
      // Resolves to undefined for the "no group" entry
      props.onRecipeGroupChange(findRecipeGroupByOption(availableGroups, option));
    }
  };


  return (
    <SelectionPopup
      label={t('screens.editRecipe.searchOrCreateRecipeGroup')}
      value={props.recipeGroup ? props.recipeGroup.title : ''}
      onValueChanged={setRecipeGroup}
      options={toRecipeGroupOptions(availableGroups, t('common.noRecipeGroup'))}
      allowCreate={true}
    />
  );
};
