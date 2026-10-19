import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text, TextInput} from 'react-native-paper';

interface Props {
  /** Finished texts, because translation keys are typed and only the caller holds the literals. */
  label: string;
  value: string;
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Lets the count be typed as well, where it can get large: whole numbers from min to max. */
  entry?: {min: number, max: number, onChange: (value: number) => void};
}

// A count changed one step at a time, or typed where tapping would take too long.
export const CountStepper = (props: Props) => (
  <View style={styles.row}>
    <Text variant="bodyLarge" style={styles.label}>{props.label}</Text>
    <IconButton
      icon="minus"
      mode="outlined"
      size={16}
      disabled={!props.canDecrease}
      accessibilityLabel={props.decreaseLabel}
      onPress={props.onDecrease} />
    {props.entry ?
      <CountEntry label={props.label} value={props.value} {...props.entry} /> :
      <Text variant="titleMedium" style={styles.value}>{props.value}</Text>}
    <IconButton
      icon="plus"
      mode="outlined"
      size={16}
      disabled={!props.canIncrease}
      accessibilityLabel={props.increaseLabel}
      onPress={props.onIncrease} />
  </View>
);

interface EntryProps {
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

// The count as a small field: valid numbers apply while typing, anything else goes back to the count on leaving.
const CountEntry = (props: EntryProps) => {
  const [text, setText] = useState(props.value);
  useEffect(() => setText(props.value), [props.value]);
  return (
    <TextInput mode="outlined" dense style={styles.entry} contentStyle={styles.entryText} keyboardType="number-pad"
      selectTextOnFocus accessibilityLabel={props.label} value={text}
      onChangeText={(changed) => {
        setText(changed);
        const count = Number(changed);
        if (/^\d+$/.test(changed) && count >= props.min && count <= props.max) {
          props.onChange(count);
        }
      }}
      onBlur={() => setText(props.value)} />
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  label: {flex: 1},
  value: {minWidth: 28, textAlign: 'center'},
  entry: {width: 64, height: 40},
  entryText: {textAlign: 'center'},
});
