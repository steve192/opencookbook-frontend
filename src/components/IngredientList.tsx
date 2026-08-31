import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Divider, Icon, IconButton, Text, TouchableRipple} from 'react-native-paper';
import {IngredientUse} from '../dao/RestAPI';
import {useAppTheme} from '../styles/CentralStyles';


interface Props {
   servings: number
   scaledServings: number
   ingredients: IngredientUse[]
   enableServingScaling?: boolean
   onServingScaleChange?: (newServings: number) => void
   greyedOutStyle?: boolean
   /** Which rows are ticked off, by index. Absent means the list is not checkable. */
   checkedIngredients?: Set<number>
   onIngredientToggle?: (index: number) => void
   /**
    * The index to identify each row by, when this list shows a subset of a longer one.
    * Without it a subset would tick off rows by their position within the subset, and three
    * lists side by side would all claim index 0. Defaults to the position in this list.
    */
   ingredientIndexes?: number[]
}


export const IngredientList = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  const getServingMultiplier = () => {
    if (!props.servings || props.servings < 1) {
      // If servings are not defined, handle as 1 serving
      return 1;
    }
    return props.scaledServings / props.servings;
  };

  const scaleIngredient = (originalAmount: number) => {
    return Math.round(originalAmount * getServingMultiplier() * 10) / 10;
  };

  const updateServings = (newServings:number) => {
    props.onServingScaleChange && props.onServingScaleChange(newServings);
  };
  const renderRow = (ingredient: IngredientUse, position: number) => {
    const index = props.ingredientIndexes?.[position] ?? position;
    const checked = props.checkedIngredients?.has(index) ?? false;
    const amountLabel = `${ingredient.amount && ingredient.amount > 0 ? scaleIngredient(ingredient.amount) : ''} ${ingredient.unit}`.trim();
    const dimmed = props.greyedOutStyle || checked;

    const row = (
      <View style={styles.row}>
        {props.onIngredientToggle &&
          <Icon
            source={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={20}
            color={checked ? theme.colors.primary : theme.colors.onSurfaceVariant} />
        }
        <Text
          style={[
            styles.amount,
            {color: dimmed ? theme.colors.onSurfaceDisabled : theme.colors.primaryText},
            checked && styles.checkedOff,
          ]}>
          {amountLabel}
        </Text>
        <Text
          style={[
            styles.name,
            {color: dimmed ? theme.colors.onSurfaceDisabled : theme.colors.onSurface},
            checked && styles.checkedOff,
          ]}>
          {ingredient.ingredient.name}
        </Text>
      </View>
    );

    return (
      <React.Fragment key={index}>
        {position > 0 && <Divider />}
        {props.onIngredientToggle ?
          <TouchableRipple onPress={() => props.onIngredientToggle?.(index)}>{row}</TouchableRipple> :
          row}
      </React.Fragment>
    );
  };

  return (
    <>
      <View>
        {props.ingredients.map((ingredient, position) => renderRow(ingredient, position))}
      </View>
      {props.enableServingScaling && <View style={styles.servingsContainer}>
        <IconButton
          size={28}
          animated
          accessibilityLabel={t('screens.recipe.servings')}
          onPress={() => {
            if (props.scaledServings === 1) {
              return;
            }
            updateServings(props.scaledServings - 1);
          }}
          icon="minus-circle-outline" />
        <Text variant="titleSmall">{t('screens.recipe.servingsCount', {count: props.scaledServings})}</Text>
        <IconButton
          size={28}
          animated
          accessibilityLabel={t('screens.recipe.servings')}
          onPress={() => updateServings(props.scaledServings + 1)}
          icon="plus-circle-outline" />
      </View>}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  amount: {
    minWidth: 74,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  name: {
    flex: 1,
  },
  checkedOff: {
    textDecorationLine: 'line-through',
  },
  servingsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingTop: 8,
  },
});
