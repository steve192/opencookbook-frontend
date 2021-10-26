import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, TopNavigation } from '@ui-kitten/components';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './src/navigation/Navigation';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { enableScreens } from 'react-native-screens'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


enableScreens()


export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <NavigationContainer>
            <MainNavigation />
          </NavigationContainer>
        </ApplicationProvider>
  </>
);

