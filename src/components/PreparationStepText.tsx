import {Text, useTheme} from '@ui-kitten/components';
import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {IngredientUse} from '../dao/RestAPI';
import fuzzy from 'fuzzy';

interface Props {
    value: string;
    style: StyleProp<TextStyle>;
    ingredients: IngredientUse[];
}
export const PreparationStepText = (props: Props) => {
  const theme = useTheme();

  const ingredientStyle: TextStyle = {
    color: theme['color-primary-default'],
    fontWeight: 'bold',
  };

  const isIngredient = (word: string) => {
    const results = fuzzy.filter(word, props.ingredients, {
      extract: (indgredient) => indgredient.ingredient.name,
    });
    if (results.length > 0 && results[0].score > 50) {
      console.log(word, 'matches to', results[0].original.ingredient.name, 'score', results[0].score);
      return true;
    } else {
      return false;
    }
  };


  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
      {props.value.split(' ').map((word) =>
                isIngredient(word) ?
                    <Text style={[props.style, ingredientStyle]}>{word} </Text> :
                    <Text style={props.style}>{word} </Text>,
      )
      }
    </View>
  );
};
