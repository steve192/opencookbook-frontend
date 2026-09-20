import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {List} from 'react-native-paper';
import {PlanningDetailsFields} from '../../components/PlanningDetailsFields';
import {Recipe, RecipeDiet} from '../../dao/RestAPI';
import {RecipeSuit, planningSummary} from '../../helper/recipeSuits';

interface Props {
  recipe: Recipe;
  expanded: boolean;
  onToggleExpanded: () => void;
  dietDerived: boolean;
  onDietChosen: (diet: RecipeDiet | null) => void;
  onSuitToggled: (suit: RecipeSuit) => void;
}

// What planning and suggestions need to know about a recipe, folded away so the editor stays about
// the recipe itself; the summary line says what is set without opening it.
export const PlanningDetailsSection = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <List.Accordion
      title={t('screens.editRecipe.planningDetails')}
      description={planningSummary(t, props.recipe) ?? t('screens.editRecipe.planningDetailsNotSet')}
      left={(listProps) => <List.Icon {...listProps} icon="calendar-heart" />}
      expanded={props.expanded}
      onPress={props.onToggleExpanded}
      style={styles.accordion}>
      <View style={styles.content}>
        <PlanningDetailsFields
          recipe={props.recipe}
          dietDerived={props.dietDerived}
          onDietChosen={props.onDietChosen}
          onSuitToggled={props.onSuitToggled} />
      </View>
    </List.Accordion>
  );
};

const styles = StyleSheet.create({
  accordion: {paddingHorizontal: 0},
  content: {paddingBottom: 8},
});
