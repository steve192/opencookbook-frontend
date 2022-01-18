import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import React from 'react';
import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {default as customMapping} from './mapping.json';
import {Prompt} from './src/helper/Prompt';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import {RootState, store} from './src/redux/store';
import {myDarkTheme} from './src/styles/custom-theme-dark';
import {myLightTheme} from './src/styles/custom-theme-light';
import {Provider as PaperProvider} from 'react-native-paper';

enableScreens();

export default () => {
  return (
    <>
      <Provider store={store}>
        <PaperProvider>
          <ReduxWrappedApp />
        </PaperProvider>
      </Provider>
    </>
  );
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
        theme={selectedTheme === 'light' ? myLightTheme : myDarkTheme}>

        <MainNavigation />
        <Prompt/>
      </ApplicationProvider>
    </>
  );
};

