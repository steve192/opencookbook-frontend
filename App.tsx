/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {Provider as PaperProvider} from 'react-native-paper';
import {enableScreens} from 'react-native-screens';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PlanningDetailsPrompt} from './src/components/PlanningDetailsPrompt';
import {Prompt} from './src/helper/Prompt';
import {TextPrompt} from './src/helper/TextPrompt';
import {CookingTimerWatcher} from './src/components/CookingTimerWatcher';
import {TimerNotificationOpener} from './src/components/TimerNotificationOpener';
import {GlobalSnackbar} from './src/helper/GlobalSnackbar';
import './src/i18n/config';
import MainNavigation from './src/navigation/MainNavigation';
import {ConnectivityWatcher} from './src/offline/ConnectivityWatcher';
import {usePageBackground} from './src/pwa/pageBackground';
import {ServiceWorkerUpdates} from './src/pwa/ServiceWorkerUpdates';
import {bootstrap} from './src/redux/sessionThunks';
import {persistor, RootState, store} from './src/redux/store';
import {OwnPaperTheme, OwnPaperThemeDark} from './src/styles/CentralStyles';
import {StyleSheet, useColorScheme} from 'react-native';

enableScreens();

export default () => {
  return (
    // Gestures are only recognised inside this, so it sits above everything that might use one.
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <Provider store={store}>
          {/* Nothing renders before what the device stored is back, so no empty list flashes up. */}
          <PersistGate persistor={persistor} onBeforeLift={() => store.dispatch(bootstrap())}>
            <ReduxWrappedApp />
          </PersistGate>
        </Provider>
      </KeyboardProvider>
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

  usePageBackground(theme.colors.primary);

  return (
    <PaperProvider theme={theme}>
      <ConnectivityWatcher />
      <ServiceWorkerUpdates />
      <MainNavigation />
      <Prompt/>
      <TextPrompt />
      <PlanningDetailsPrompt />
      <GlobalSnackbar />
      {/* Cooking timers announce themselves from anywhere in the app, not just from the
          step that started them, and tapping one goes back to the step it came from */}
      <CookingTimerWatcher />
      <TimerNotificationOpener />
    </PaperProvider>
  );
};

