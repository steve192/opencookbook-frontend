import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {InfoButton} from '../InfoButton';

interface Props {
  label: string;
  value: number;
  /** Called with valid numbers only; while the field holds something else the last valid one stands. */
  onChange: (value: number) => void;
  /** The unit shown after the number, such as "g" or "°C". */
  unit?: string;
  min: number;
  max: number;
  /** Shown below the field. */
  hint?: string;
  /** A longer explanation behind an info icon. */
  info?: string;
}

const parse = (text: string): number | undefined => {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() === '' || Number.isNaN(value) ? undefined : value;
};

const format = (value: number) => String(Math.round(value * 100) / 100);

// A number typed as text: "12," stays on screen while it is being typed, and either decimal mark works.
export const NumberField = (props: Props) => {
  const [text, setText] = useState(format(props.value));

  // Follows changes from elsewhere, such as switching units, without fighting the typing.
  useEffect(() => {
    if (parse(text) !== props.value) {
      setText(format(props.value));
    }
  }, [props.value]);

  const value = parse(text);
  const valid = value != null && value >= props.min && value <= props.max;

  const field = (
    <TextInput
      mode="outlined"
      dense
      style={styles.input}
      keyboardType="decimal-pad"
      label={props.label}
      value={text}
      error={!valid}
      right={props.unit ? <TextInput.Affix text={props.unit} /> : undefined}
      onChangeText={(changed) => {
        setText(changed);
        const parsed = parse(changed);
        if (parsed != null && parsed >= props.min && parsed <= props.max) {
          props.onChange(parsed);
        }
      }} />
  );

  return (
    <>
      {props.info ?
        <View style={styles.row}>
          <View style={styles.input}>{field}</View>
          <InfoButton title={props.label} text={props.info} />
        </View> :
        field}
      {props.hint && <HelperText type="info" padding="none">{props.hint}</HelperText>}
    </>
  );
};

const styles = StyleSheet.create({
  input: {flexGrow: 1},
  row: {flexDirection: 'row', alignItems: 'center', gap: 4},
});
