import * as eva from '@eva-design/eva';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { default as customMapping } from './mapping.json';
import MainNavigation from './src/navigation/Navigation';
import { myLightTheme } from './src/styles/custom-theme-light';
import { Provider, useSelector } from 'react-redux'
import { RootState, store } from './src/redux/store';
import { myDarkTheme } from './src/styles/custom-theme-dark';

enableScreens()

export default () => {

  return (
    <>
      <Provider store={store}>
        <ReduxWrappedApp />
      </Provider>
    </>
  )
};

const ReduxWrappedApp = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        {...eva}
        // @ts-ignore
        customMapping={customMapping}
        theme={selectedTheme === "light" ? myLightTheme : myDarkTheme}>
        <NavigationContainer>
          <MainNavigation />
        </NavigationContainer>
      </ApplicationProvider>
    </>
  )
}

