import React from 'react';
import {Text} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  note: string;
  /** Lighter than the name by default. */
  color?: string;
}

// What a recipe line says beside its food, inside the name's text: "Butter, weich".
export const IngredientNote = (props: Props) => {
  const theme = useAppTheme();
  return props.note ?
    <Text style={{color: props.color ?? theme.colors.onSurfaceVariant}}>{`, ${props.note}`}</Text> :
    null;
};
