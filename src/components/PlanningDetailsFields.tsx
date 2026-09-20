import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {Recipe, RecipeDiet} from '../dao/RestAPI';
import {RECIPE_DIETS, dietLabel} from '../helper/recipeDiet';
import {RECIPE_SUITS, RecipeSuit, isSuited, suitLabel} from '../helper/recipeSuits';
import {ChoiceChips} from './ChoiceChips';
import {HintText} from './QuestionSection';

interface Props {
  recipe: Recipe;
  /** Whether the diet shown was read from the ingredients rather than chosen. */
  dietDerived?: boolean;
  onDietChosen: (diet: RecipeDiet | null) => void;
  onSuitToggled: (suit: RecipeSuit) => void;
}

// What planning and suggestions need to know about a recipe: its diet, and the meals it suits or
// that it is no dish of its own. The same questions in the editor and right after an import.
export const PlanningDetailsFields = (props: Props) => {
  const {t} = useTranslation('translation');
  const {recipe} = props;
  return (
    <View style={styles.fields}>
      <SegmentedButtons
        density="small"
        value={recipe.recipeType ?? ''}
        // Tapping the selected option again clears it, so a recipe can go back to unset
        onValueChange={(value) => props.onDietChosen(value === recipe.recipeType ? null : (value as RecipeDiet))}
        buttons={RECIPE_DIETS.map((diet) => ({value: diet, label: dietLabel(t, diet) ?? diet}))} />
      {props.dietDerived && <HintText>{t('screens.editRecipe.dietDerived')}</HintText>}
      <ChoiceChips
        compact
        values={RECIPE_SUITS}
        isChosen={(suit) => isSuited(recipe, suit)}
        label={(suit) => suitLabel(t, suit)}
        onToggle={props.onSuitToggled} />
      <HintText>{t('screens.editRecipe.suitsHint')}</HintText>
    </View>
  );
};

const styles = StyleSheet.create({
  fields: {gap: 8},
});
