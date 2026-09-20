/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider as PaperProvider} from 'react-native-paper';
import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {PlanningDetailsPrompt} from './src/components/PlanningDetailsPrompt';
import {Prompt} from './src/helper/Prompt';
import {CookingTimerWatcher} from './src/components/CookingTimerWatcher';
import {TimerNotificationOpener} from './src/components/TimerNotificationOpener';
import {GlobalSnackbar} from './src/helper/GlobalSnackbar';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import RestAPI from './src/dao/RestAPI';
import {logout} from './src/redux/features/authSlice';
import {RootState, store} from './src/redux/store';
import {OwnPaperTheme, OwnPaperThemeDark} from './src/styles/CentralStyles';
import {StyleSheet, useColorScheme} from 'react-native';

enableScreens();

// A session that can no longer be renewed means the login screen, wherever the app happens to be.
RestAPI.onSessionExpired = () => store.dispatch(logout());

export default () => {
  return (
    // Gestures are only recognised inside this, so it sits above everything that might use one.
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <ReduxWrappedApp />
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},
});


const ReduxWrappedApp = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const colorScheme = useColorScheme();

  let theme;

  if (selectedTheme == 'light') {
    theme = OwnPaperTheme;
  } else if (selectedTheme == 'dark') {
    theme = OwnPaperThemeDark;
  } else {
    theme = colorScheme == 'light' ? OwnPaperTheme : OwnPaperThemeDark;
  }


  return (
    <PaperProvider theme={theme}>
      <MainNavigation />
      <Prompt/>
      <PlanningDetailsPrompt />
      <GlobalSnackbar />
      {/* Cooking timers announce themselves from anywhere in the app, not just from the
          step that started them, and tapping one goes back to the step it came from */}
      <CookingTimerWatcher />
      <TimerNotificationOpener />
    </PaperProvider>
  );
};

