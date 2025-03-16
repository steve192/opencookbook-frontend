import {Stack} from 'expo-router';
import {useAppSelector} from '../redux/hooks';
import React from 'react';
import {SplashScreen} from '../screens/LoginScreen/SplashScreen';
import {Provider, useSelector} from 'react-redux';
import {enableScreens} from 'react-native-screens';
import {RootState, store} from '../redux/store';
import {useColorScheme} from 'react-native';
import {OwnPaperTheme, OwnPaperThemeDark} from '../styles/CentralStyles';
import {PaperProvider} from 'react-native-paper';
import {Prompt} from '../helper/Prompt';
import {GlobalSnackbar} from '../helper/GlobalSnackbar';
import '../i18n/config';
enableScreens();

const Layout = () => {
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
    theme = colorScheme == 'light' ? OwnPaperTheme : OwnPaperThemeDark;
  }


  return (
    <PaperProvider theme={theme}>
      {/* <MainNavigation /> */}
      <LayoutS />
      <Prompt/>
      <GlobalSnackbar />
    </PaperProvider>
  );
};


const LayoutS = () => {
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      <Stack.Screen name="login" options={{headerShown: false}} />
      <Stack.Screen name="main" options={{headerShown: false}} />
      <Stack.Screen name="activate-account" options={{headerShown: false}} />
      <Stack.Screen name="reset-password" options={{headerShown: false}} />
      <Stack.Screen name="requestResetPassword" options={{headerShown: false}} />
      <Stack.Screen name="tos" options={{headerShown: true, title: 'TOS'}} />
      <Stack.Screen name="signup" options={{headerShown: false}} />
    </Stack>
  );
};

export default Layout;
