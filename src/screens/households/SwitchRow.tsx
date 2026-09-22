import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Switch, Text} from 'react-native-paper';

interface Props {
  label: string;
  explanation: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

/**
 * A labelled switch with an explanation under it.
 *
 * @param {Props} props what it says and what flipping it does
 * @return {JSX.Element} the row
 */
export const SwitchRow = (props: Props) => (
  <View>
    <View style={styles.row}>
      <Text style={styles.label}>{props.label}</Text>
      <Switch value={props.value} disabled={props.disabled} onValueChange={props.onChange} />
    </View>
    <Text variant="bodySmall">{props.explanation}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
  },
});
