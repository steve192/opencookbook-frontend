import React, {useMemo} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {IngredientUse} from '../dao/RestAPI';
import {matchIngredientsInStep, splitStepForHighlighting} from '../helper/ingredientMatching';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
    value: string;
    style: StyleProp<TextStyle>;
    ingredients: IngredientUse[];
}

export const PreparationStepText = (props: Props) => {
  const theme = useAppTheme();

  // One pass over the step, memoised. This used to fuzzy match every single word against
  // every ingredient on every render, and log each hit to the console. It also rendered
  // each word as its own Text inside a wrapping row, which broke text selection and left
  // the line breaking to the layout engine rather than the text engine.
  const parts = useMemo(() => {
    const {highlights} = matchIngredientsInStep(props.value, props.ingredients);
    return splitStepForHighlighting(props.value, highlights);
  }, [props.value, props.ingredients]);

  return (
    <Text style={props.style}>
      {parts.map((part, index) => (
        <Text
          key={index}
          style={part.highlighted ? {color: theme.colors.primaryText, fontWeight: 'bold'} : undefined}>
          {part.text}
        </Text>
      ))}
    </Text>
  );
};
