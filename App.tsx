/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {Prompt} from './src/helper/Prompt';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import {RootState, store} from './src/redux/store';
import {OwnPaperTheme, OwnPaperThemeDark} from './src/styles/CentralStyles';
import {useColorScheme} from 'react-native';

enableScreens();

export default () => {
  return (
    <Provider store={store}>
      <ReduxWrappedApp />
    </Provider>
  );
};


const ReduxWrappedApp = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const colorScheme = useColorScheme();

  let theme;

  if (selectedTheme == 'light') {
    theme = OwnPaperTheme;
  } else if (selectedTheme == 'dark') {
    theme = OwnPaperThemeDark;
  } else {
    theme = OwnPaperThemeDark;
  }


  return (
    <PaperProvider theme={theme}>
      <MainNavigation />
      <Prompt/>
    </PaperProvider>
  );
};

