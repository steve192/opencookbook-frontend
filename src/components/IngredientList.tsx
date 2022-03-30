import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Divider, IconButton, Text, useTheme} from 'react-native-paper';
import Spacer from 'react-spacer';
import {IngredientUse} from '../dao/RestAPI';


interface Props {
   servings: number
   scaledServings: number
   ingredients: IngredientUse[]
   enableServingScaling?: boolean
   onServingScaleChange?: (newServings: number) => void
   greyedOutStyle?: boolean
}


export const IngredientList = (props: Props) => {
  const theme = useTheme();
  const {t} = useTranslation('translation');

  const getServingMultiplier = () => {
    return props.scaledServings / props.servings;
  };

  const scaleIngredient = (originalAmount: number) => {
    return Math.round(originalAmount * getServingMultiplier() * 10) / 10;
  };

  const updateServings = (newServings:number) => {
    props.onServingScaleChange && props.onServingScaleChange(newServings);
  };
  return (
    <>
      {/* <View style={{ flexDirection: "row", flexWrap:"wrap", justifyContent: "space-evenly" }}> */}
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        {props.ingredients.map((ingredient, index) =>
          <React.Fragment key={index}>
            <Divider />
            <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
              <Text
                style={{
                  flex: 2,
                  alignSelf: 'stretch',
                  color: props.greyedOutStyle ? theme.colors.disabled: theme.colors.primary,
                  fontWeight: 'bold',
                }}>{ingredient.amount > 0 ? `${scaleIngredient(ingredient.amount)} ${ingredient.unit}` : ''}
              </Text>

              <Text style={{flex: 4, alignSelf: 'stretch', color: props.greyedOutStyle ? theme.colors.disabled : theme.colors.text}} >{ingredient.ingredient.name}</Text>
            </View>
          </React.Fragment>,
        )}
      </View>
      <Spacer height={20} />
      {props.enableServingScaling && <View style={styles.servingsContainer}>
        <IconButton
          size={32}
          animated
          onPress={() => {
            if (props.scaledServings === 1) {
              return;
            }
            updateServings(
                props.scaledServings - 1);
          }}
          icon="minus-circle" />
        <Text style={{paddingHorizontal: 20}}> {props.scaledServings} {t('screens.recipe.servings')}</Text>
        <IconButton
          size={32}
          animated
          onPress={() => updateServings(props.scaledServings + 1)}
          icon="plus-circle" />
      </View>}
    </>
  );
};

const styles = StyleSheet.create({
  servingsContainer: {

    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',

  },
});
