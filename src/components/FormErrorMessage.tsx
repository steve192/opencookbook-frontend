import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  /** Nothing is rendered without one, so a caller can hand over its state directly. */
  message?: string;
  testID?: string;
}

/**
 * A failure shown next to the form that caused it.
 *
 * On its own solid ground rather than as coloured text: these forms sit over a photograph, where
 * an error colour that reads in one corner of the picture disappears into another. The container
 * colours are a matched pair, so the message is legible whatever is behind it.
 *
 * @param {Props} props the message to show
 * @return {JSX.Element | null} the message, or nothing when there is none
 */
export const FormErrorMessage = ({message, testID}: Props) => {
  const theme = useAppTheme();

  if (!message) {
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[styles.banner, {backgroundColor: theme.colors.errorContainer}]}>
      <Icon source="alert-circle-outline" size={20} color={theme.colors.onErrorContainer} />
      <Text style={[styles.message, {color: theme.colors.onErrorContainer}]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  message: {
    flex: 1,
    fontWeight: 'bold',
  },
});
