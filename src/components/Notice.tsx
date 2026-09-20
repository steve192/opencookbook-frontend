import React from 'react';
import {StyleSheet} from 'react-native';
import {Icon, Surface, Text} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  icon: string;
  /** A warning is about results that will be poor; information is about something to complete. */
  tone: 'warning' | 'information';
  children: string;
}

// A short message above a form: an icon and a sentence on a tinted background.
export const Notice = (props: Props) => {
  const theme = useAppTheme();
  const [background, foreground] = props.tone === 'warning' ?
    [theme.colors.errorContainer, theme.colors.onErrorContainer] :
    [theme.colors.secondaryContainer, theme.colors.onSecondaryContainer];
  return (
    <Surface style={[styles.notice, {backgroundColor: background}]} elevation={0}>
      <Icon source={props.icon} size={20} color={foreground} />
      <Text variant="bodySmall" style={[styles.text, {color: foreground}]}>{props.children}</Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  notice: {flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, alignItems: 'flex-start'},
  text: {flex: 1},
});
