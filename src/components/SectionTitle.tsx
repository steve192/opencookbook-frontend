import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

interface Props {
  children: string;
  testID?: string;
}

// The heading of a section of a recipe. All three recipe screens used to declare this and
// its style for themselves, and before that they used Paper's Caption, which made every
// heading smaller than the text beneath it.
export const SectionTitle = (props: Props) => (
  <Text variant="titleMedium" testID={props.testID} style={styles.title}>
    {props.children}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
  },
});
