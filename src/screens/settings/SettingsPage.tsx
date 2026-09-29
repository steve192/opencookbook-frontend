import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Surface, Text} from 'react-native-paper';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

// The frame every settings screen shares: scrolling, and as wide as the rest of the app's content.
export const SettingsPage = ({children}: {children: React.ReactNode}) => (
  <Surface style={CentralStyles.screen}>
    <ScrollView contentContainerStyle={[CentralStyles.contentContainer, styles.page]}>{children}</ScrollView>
  </Surface>
);

export const SettingsHint = ({children}: {children: React.ReactNode}) => {
  const theme = useAppTheme();
  return <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{children}</Text>;
};

const styles = StyleSheet.create({
  page: {gap: 20},
});
