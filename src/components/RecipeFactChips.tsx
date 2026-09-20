import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Chip} from 'react-native-paper';
import {Recipe, ScoreReason} from '../dao/RestAPI';
import {formatRecipeTime} from '../helper/recipeDuration';
import {scoreReasonLabel, shownReasons} from '../helper/scoreReasons';

interface Props {
  recipe: Recipe;
  /** Every term the server scored; only those worth naming are shown. */
  reasons: ScoreReason[];
  servings?: number | null;
}

// How long a ranked recipe takes and why it was chosen, for suggestions and planned weeks alike.
export const RecipeFactChips = (props: Props) => {
  const {t} = useTranslation('translation');
  const time = formatRecipeTime(props.recipe);
  return (
    <View style={styles.chips}>
      {time && <Chip compact icon="clock-outline">{time}</Chip>}
      {props.servings && <Chip compact icon="account-multiple-outline">{props.servings}</Chip>}
      {shownReasons(props.reasons).map((reason) => (
        <Chip compact key={reason.term}>{scoreReasonLabel(t, reason)}</Chip>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
});
