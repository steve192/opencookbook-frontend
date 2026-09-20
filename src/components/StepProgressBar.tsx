import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  /** From 0 to 1. */
  progress: number;
}

// How far through a sequence of steps the user is. In the on-surface tone rather than Paper's primary default,
// which ran together with the green app bar. The fixed-height wrapper matters on web, where Paper sizes the bar
// to 100% of its parent and an auto-height parent collapses.
export const StepProgressBar = (props: Props) => {
  const theme = useAppTheme();
  return (
    <View style={styles.track}>
      <ProgressBar
        progress={props.progress}
        color={theme.colors.primaryText}
        style={[styles.bar, {backgroundColor: theme.colors.surfaceVariant}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {height: 6},
  bar: {height: 6, borderRadius: 3},
});
