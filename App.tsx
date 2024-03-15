/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
import React from 'react';
import {MD3LightTheme, Provider as PaperProvider, useTheme} from 'react-native-paper'; import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {Prompt} from './src/helper/Prompt';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import {RootState, store} from './src/redux/store';
import {MD3Colors} from 'react-native-paper/lib/typescript/types';
import {OwnPaperTheme, OwnPaperThemeDark} from './src/styles/CentralStyles';
import createIconSet from '@expo/vector-icons/build/MaterialCommunityIcons.js';
import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import { createIconSetFromFontello } from 'react-native-vector-icons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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


  return (
    <PaperProvider theme={selectedTheme === 'light' ? OwnPaperTheme : OwnPaperThemeDark}>
      <MainNavigation />
      <MaterialCommunityIcons name='eye'></MaterialCommunityIcons>
      <Prompt/>
    </PaperProvider>
  );
};

