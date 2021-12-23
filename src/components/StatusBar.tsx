import {useTheme} from '@ui-kitten/components';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import React from 'react';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';


export const StatusBar = () => {
  const theme = useTheme();
  return (
    <>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => insets && <View style={{paddingTop: insets.top, backgroundColor: theme['color-primary-default']}} />}
      </SafeAreaInsetsContext.Consumer>
      <ExpoStatusBar style="light" />
    </>
  );
};
