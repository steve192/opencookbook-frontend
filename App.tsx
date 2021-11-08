import * as eva from '@eva-design/eva';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { default as customMapping } from './mapping.json';
import MainNavigation from './src/navigation/Navigation';
import { myTheme } from './src/styles/custom-theme-dark';

enableScreens()

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider
      {...eva}
      // @ts-ignore
      customMapping={customMapping}
      theme={myTheme}>
      {/* <SafeAreaProvider> */}
      {/* <SafeAreaView style={{ flex: 1 }}> */}

      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
      {/* </SafeAreaView> */}
      {/* </SafeAreaProvider> */}
    </ApplicationProvider>
  </>
);

