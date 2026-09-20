import React from 'react';
import {StyleSheet} from 'react-native';
import {TextInput} from 'react-native-paper';

interface Props {
  label: string;
  /** Null or undefined shows an empty field. */
  value: number | null | undefined;
  onChangeText: (text: string) => void;
}

// A wizard's number answer; the text goes back as typed, for the helper to parse.
export const NumberInput = (props: Props) => (
  <TextInput
    mode="outlined"
    dense
    style={styles.input}
    keyboardType="numeric"
    label={props.label}
    value={props.value != null ? String(props.value) : ''}
    onChangeText={props.onChangeText} />
);

const styles = StyleSheet.create({
  input: {flex: 1},
});
