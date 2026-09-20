import React from 'react';
import {View} from 'react-native';
import {Chip} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';
import {QuestionSection} from './QuestionSection';

interface Props<T extends string | number> {
  /** The finished title: translation keys are typed, and only the caller holds the literal. Left out where the surroundings already say what is asked. */
  title?: string;
  hint?: string;
  values: T[];
  isChosen: (value: T) => boolean;
  label: (value: T) => string;
  onToggle: (value: T) => void;
  compact?: boolean;
}

// A question answered by tapping chips, whether one of them or several.
export const ChoiceChips = <T extends string | number>(props: Props<T>) => {
  const chips = (
    <View style={CentralStyles.chipRow}>
      {props.values.map((value) => (
        <Chip key={value} compact={props.compact} selected={props.isChosen(value)} showSelectedCheck
          onPress={() => props.onToggle(value)}>
          {props.label(value)}
        </Chip>
      ))}
    </View>
  );
  return props.title ? <QuestionSection title={props.title} hint={props.hint}>{chips}</QuestionSection> : chips;
};
