import fuzzy from 'fuzzy';
import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {Text} from 'react-native-paper';
import {IngredientUse} from '../dao/RestAPI';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
    value: string;
    style: StyleProp<TextStyle>;
    ingredients: IngredientUse[];
}
export const PreparationStepText = (props: Props) => {
  const theme = useAppTheme();

  const ingredientStyle: TextStyle = {
    color: theme.colors.primary,
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
