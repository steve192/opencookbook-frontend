import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

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
}

// A small count changed one step at a time, where typing a number would be more work than tapping.
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
    <Text variant="titleMedium" style={styles.value}>{props.value}</Text>
    <IconButton
      icon="plus"
      mode="outlined"
      size={16}
      disabled={!props.canIncrease}
      accessibilityLabel={props.increaseLabel}
      onPress={props.onIncrease} />
  </View>
);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  label: {flex: 1},
  value: {minWidth: 28, textAlign: 'center'},
});
