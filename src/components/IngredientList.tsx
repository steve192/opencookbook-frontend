import {Button, Divider, Text, useTheme} from '@ui-kitten/components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import Spacer from 'react-spacer';
import {MinusIcon, PlusIcon} from '../assets/Icons';
import {IngredientUse} from '../dao/RestAPI';
import CentralStyles from '../styles/CentralStyles';


interface Props {
   servings: number
   scaledServings: number
   ingredients: IngredientUse[]
   enableServingScaling?: boolean
   onServingScaleChange?: (newServings: number) => void
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
      <Text category="label">{t('screens.recipe.ingredients')}</Text>
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
                  color: theme['color-primary-default'],
                  fontWeight: 'bold',
                }}>{ingredient.amount > 0 ? `${scaleIngredient(ingredient.amount)} ${ingredient.unit}` : ''}
              </Text>

              <Text style={{flex: 4, alignSelf: 'stretch'}} >{ingredient.ingredient.name}</Text>
            </View>
          </React.Fragment>,
        )}
      </View>
      <Spacer height={20} />
      {props.enableServingScaling && <View style={styles.servingsContainer}>
        <Button
          style={CentralStyles.iconButton}
          size='tiny'
          onPress={() => {
            if (props.scaledServings === 1) {
              return;
            }
            updateServings(
                props.scaledServings - 1);
          }}
          accessoryLeft={<MinusIcon />} />
        <Text style={{paddingHorizontal: 20}}> {props.scaledServings} {t('screens.recipe.servings')}</Text>
        <Button
          style={CentralStyles.iconButton}
          size='tiny'
          onPress={() => updateServings(props.scaledServings + 1)}
          accessoryLeft={<PlusIcon />} />
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
