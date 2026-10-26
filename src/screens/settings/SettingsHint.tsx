import React from 'react';
import {Text} from 'react-native-paper';
import {useAppTheme} from '../../styles/CentralStyles';

export const SettingsHint = ({children}: {children: React.ReactNode}) => {
  const theme = useAppTheme();
  return <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{children}</Text>;
};
