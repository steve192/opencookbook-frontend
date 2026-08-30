import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SelectionPopup} from '../../components/SelectionPopup';
import {Option} from '../../components/SelectionPopupModal';
import RestAPI, {RecipeGroup} from '../../dao/RestAPI';
import {findRecipeGroupByOption, toRecipeGroupOptions} from '../../helper/recipeGroups';


interface Props {
    recipeGroup?: RecipeGroup
    onRecipeGroupChange: (newIngredient: RecipeGroup | undefined) => void
}

export const RecipeGroupFormField = (props: Props) => {
  const [availableGroups, setAvailableGroups] = useState<RecipeGroup[]>([]);

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


  const queryGroups = () => {
    RestAPI.getRecipeGroups()
        .then((groups) => {
          setAvailableGroups(groups);
        });
  };

  useEffect(queryGroups, []);

  return (
    <>
      <SelectionPopup
        label={t('screens.editRecipe.searchOrCreateRecipeGroup')}
        value={props.recipeGroup ? props.recipeGroup.title : ''}
        onValueChanged={setRecipeGroup}
        options={toRecipeGroupOptions(availableGroups, t('common.noRecipeGroup'))}
        allowAdditionalValues={true}
      />
    </>
  );
};
