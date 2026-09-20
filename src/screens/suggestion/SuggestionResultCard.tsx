import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {RecipeFactChips} from '../../components/RecipeFactChips';
import {RecipeRowCard} from '../../components/RecipeRowCard';
import {SuggestedRecipe} from '../../dao/RestAPI';
import {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  suggestion: SuggestedRecipe;
  onOpen: () => void;
  onAddToToday: () => void;
  added: boolean;
}

export const SuggestionResultCard = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const {recipe, matchedIngredients, missingIngredients} = props.suggestion;

  return (
    <View style={styles.spacing}>
      <RecipeRowCard recipe={recipe} onOpen={props.onOpen}>
        {/* Coloured rather than labelled: next to the greyed "needs" line below, that is
            enough to read these as the ingredients the cook already named. */}
        {matchedIngredients.length > 0 &&
          <Text numberOfLines={2} variant="bodySmall" style={{color: theme.colors.primary}}>
            {matchedIngredients.map((ingredient) => ingredient.name).join(', ')}
          </Text>
        }
        {missingIngredients.length > 0 &&
          <Text numberOfLines={1} variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {t('screens.suggestion.doesNotUse', {
              ingredients: missingIngredients.map((ingredient) => ingredient.name).join(', '),
            })}
          </Text>
        }

        <RecipeFactChips recipe={recipe} reasons={props.suggestion.reasons} />

        <Button
          compact
          style={styles.addButton}
          onPress={props.onAddToToday}
          disabled={props.added}>
          {t(props.added ? 'screens.suggestion.addedToWeekplan' : 'screens.suggestion.addToWeekplan')}
        </Button>
      </RecipeRowCard>
    </View>
  );
};

const styles = StyleSheet.create({
  spacing: {
    marginBottom: 8,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
