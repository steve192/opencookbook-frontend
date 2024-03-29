import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SelectionPopup} from '../../components/SelectionPopup';
import {Option} from '../../components/SelectionPopupModal';
import RestAPI, {RecipeGroup} from '../../dao/RestAPI';


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
      const existingGroup = availableGroups.find((group) => group.id?.toString() === option.key);
      if (existingGroup) {
        props.onRecipeGroupChange(existingGroup);
      } else {
        // No group selected
        props.onRecipeGroupChange(undefined);
      }
    }
  };


  const queryGroups = () => {
    RestAPI.getRecipeGroups()
        .then((groups) => {
          setAvailableGroups(groups);
        });
  };

  const getOptions = () => {
    // The key for "no group selected". Can be anything that will never exist in the real ids
    let groups: Option[] = [{key: 'none', value: 'No group'}];
    groups = [...groups, ...availableGroups.map((group) => ({key: group.id ? group.id.toString() : '', value: group.title}))];
    return groups;
  };


  useEffect(queryGroups, []);

  return (
    <>
      <SelectionPopup
        label={t('screens.editRecipe.searchOrCreateRecipeGroup')}
        value={props.recipeGroup ? props.recipeGroup.title : ''}
        onValueChanged={setRecipeGroup}
        options={getOptions()}
        allowAdditionalValues={true}
      />
    </>
  );
};
