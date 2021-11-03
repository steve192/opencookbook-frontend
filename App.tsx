import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, TopNavigation } from '@ui-kitten/components';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './src/navigation/Navigation';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { enableScreens } from 'react-native-screens'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { myTheme } from './src/styles/custom-theme-light';
import { KeyboardAvoidingView, Platform } from 'react-native';


enableScreens()


export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={myTheme}>
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

