/* eslint-disable react/display-name */
import React from 'react';
import {DefaultTheme, MD3LightTheme, Provider as PaperProvider} from 'react-native-paper';
import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {Prompt} from './src/helper/Prompt';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import {RootState, store} from './src/redux/store';

enableScreens();

export default () => {
  return (
    <>
      <Provider store={store}>

        <ReduxWrappedApp />

      </Provider>
    </>
  );
};
const paperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#72B600',
    accent: '#FFE102',
    success: '#00FF00',
    background: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
  },

};


const ReduxWrappedApp = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);


  const darkPaperTheme = {
    // ...DarkTheme,
    // roundness: 10,
    // colors: {
    //   ...DarkTheme.colors,
    //   primary: '#72B600',
    //   accent: '#FFE102',
    //   background: '#000000',
    //   success: '#72B600',
    //   textOnPrimary: Colors.white,
    // },
  };
  return (
    <PaperProvider theme={selectedTheme === 'light' ? paperTheme : darkPaperTheme}>
      <MainNavigation />
      <Prompt/>
    </PaperProvider>
  );
};

