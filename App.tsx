import * as eva from '@eva-design/eva';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { default as customMapping } from './mapping.json';
import MainNavigation from './src/navigation/Navigation';
import { myTheme } from './src/styles/custom-theme-light';
import { Provider } from 'react-redux'
import { store } from './src/redux/store';

enableScreens()

export default () => (
  <>
  <Provider store={store}>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider
      {...eva}
      // @ts-ignore
      customMapping={customMapping}
      theme={myTheme}>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
    </ApplicationProvider>
    </Provider>
  </>
);

