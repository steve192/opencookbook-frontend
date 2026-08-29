import {MaterialCommunityIcons} from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import {BottomTabNavigationOptions, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createURL} from 'expo-linking';
import {StatusBar} from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {Appbar} from 'react-native-paper';
import AppPersistence from '../AppPersistence';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {changeOnlineState} from '../redux/features/settingsSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {AccountActivationScreen} from '../screens/AccountActivationScreen';
import {GuidedCookingScreen} from '../screens/GuidedCookingScreen';
import {ImportScreen} from '../screens/ImportScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import {RequestPasswordResetScreen} from '../screens/LoginScreen/RequestPasswordResetScreen';
import {SignupScreen} from '../screens/LoginScreen/SignupScreen';
import {SplashScreen} from '../screens/LoginScreen/SplashScreen';
import {PasswordResetScreen} from '../screens/PasswordResetScreen';
import {RecipeGroupEditScreen} from '../screens/RecipeGroupEditScreen';
import {RecipeImportBrowser} from '../screens/RecipeImportBrowser';
import RecipeListScreen from '../screens/RecipeListScreen';
import {RecipeScreen} from '../screens/RecipeScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {TermsOfServiceScreen} from '../screens/TermsOfSerciceScreen';
import {WeeklyRecipeListScreen} from '../screens/weeklyrecipelist/WeeklyRecipeListScreen';
import RecipeWizardScreen from '../screens/wizard/RecipeWizardScreen';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {
  BaseNavigatorProps,
  LoginNavigationProps,
  MainNavigationProps,
  OverviewNavigationProps,
  RecipeScreenNavigation,
} from './NavigationRoutes';

// One typed navigator instance per stack — keeps the param-list -> screen-component
// type relationships intact (createNativeStackNavigator<...> defaults to ParamListBase
// which forces components to be FunctionComponent<{}>).
const BaseStack = createNativeStackNavigator<BaseNavigatorProps>();
const LoginStack = createNativeStackNavigator<LoginNavigationProps>();
const MainStack = createNativeStackNavigator<MainNavigationProps>();
const RecipeStack = createNativeStackNavigator<RecipeScreenNavigation>();
const BottomTab = createBottomTabNavigator<OverviewNavigationProps>();


const LoginStackNavigation = () => (
  <LoginStack.Navigator>
    <LoginStack.Screen
      name="LoginScreen"
      component={LoginScreen}
      options={{headerShown: false}} />
    <LoginStack.Screen
      name="SignupScreen"
      component={SignupScreen}
      options={{headerShown: false}} />
    <LoginStack.Screen
      name='RequestPasswordResetScreen'
      component={RequestPasswordResetScreen}
      options={{headerShown: false}} />
  </LoginStack.Navigator>
);


const RecipeStackNavigation = () => (
  <RecipeStack.Navigator>
    <RecipeStack.Screen
      name="RecipeListDetailScreen"
      component={RecipeListScreen}
      options={{headerShown: false}} />
  </RecipeStack.Navigator>
);


// Every tab repeats the same icon render-prop shape. Factoring it out keeps the
// navigator declarative and puts the sizing/tinting decision in one place. The
// renderer signature is derived from the navigator's own option type, so it
// stays correct if React Navigation changes what it passes in.
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type TabBarIconRenderer = NonNullable<BottomTabNavigationOptions['tabBarIcon']>;

const tabBarIcon = (name: MaterialCommunityIconName): TabBarIconRenderer =>
  function TabBarIcon({color, size}) {
    return <MaterialCommunityIcons name={name} color={color} size={size} />;
  };

const BottomTabNavigation = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  return (
    <BottomTab.Navigator
      backBehavior="history"
      screenOptions={{
        // The surrounding native stack already renders the Paper Appbar; the
        // tab navigator must not add a second header of its own.
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {backgroundColor: theme.colors.surface},
      }}
    >
      <BottomTab.Screen
        name="RecipesListScreen"
        component={RecipeStackNavigation}
        options={{
          title: t('screens.overview.myRecipes'),
          tabBarIcon: tabBarIcon('home'),
        }} />
      <BottomTab.Screen
        name="WeeklyScreen"
        component={WeeklyRecipeListScreen}
        options={{
          title: t('screens.weekplan.screenTitle'),
          tabBarIcon: tabBarIcon('calendar'),
        }} />
      <BottomTab.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          title: t('screens.settings.screenTitle'),
          tabBarIcon: tabBarIcon('cog-off-outline'),
        }} />
    </BottomTab.Navigator>
  );
};


const MainStackNavigation = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  return (
    <KeyboardAvoidingView style={CentralStyles.fullscreen}>
      <MainStack.Navigator
        screenOptions={{
          header: (nav) => (
            <Appbar.Header style={{backgroundColor: theme.colors.primary}}>
              {nav.back ? (
                <Appbar.BackAction
                  color={theme.colors.onPrimary}
                  onPress={() => nav.navigation.goBack()} />
              ) : null}
              {nav.options.headerLeft?.({tintColor: undefined, canGoBack: false})}
              <Appbar.Content color={theme.colors.onPrimary} title={nav.options.title} />
              {nav.options.headerRight?.({tintColor: undefined, canGoBack: false})}
            </Appbar.Header>
          ),
        }}>
        <MainStack.Screen
          name="OverviewScreen"
          component={BottomTabNavigation}
        />
        <MainStack.Screen
          name="RecipeWizardScreen"
          component={RecipeWizardScreen}
        />
        <MainStack.Screen
          name="RecipeImportBrowser"
          component={RecipeImportBrowser}
          options={{title: t('navigation.screenTitleImportBrowser')}}
        />
        <MainStack.Screen
          name="ImportScreen"
          component={ImportScreen}
          options={{title: t('navigation.screenTitleImport')}}
        />
        <MainStack.Screen
          name="RecipeGroupEditScreen"
          component={RecipeGroupEditScreen}
          options={{title: t('navigation.screenTitleCreateRecipeGroup')}}
        />
        <MainStack.Screen
          name="GuidedCookingScreen"
          component={GuidedCookingScreen}
          options={{title: t('navigation.screenTitleGuidedCooking')}}
        />
        <MainStack.Screen
          name="RecipeScreen"
          component={RecipeScreen}
        />
      </MainStack.Navigator>
    </KeyboardAvoidingView>
  );
};


const MainNavigation = () => {
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();

  const [initializersRun, setInitializersRun] = useState(false);

  const {t} = useTranslation('translation');

  useEffect(() => {
    if (initializersRun) {
      return;
    }
    setInitializersRun(true);

    (async () => {
      NetInfo.addEventListener((state) => {
        if (Platform.OS === 'android') {
          dispatch(changeOnlineState(state.isInternetReachable === true));
        } else {
          dispatch(changeOnlineState(state.isConnected === true));
        }
      });

      // Check for new app versions
      const info = await NetInfo.fetch();
      if (info.isInternetReachable) {
        const updateAsync = async () => {
          console.log('Update check');
          await new Promise((r) => setTimeout(r, 1000));
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log('Download update');
            await Updates.fetchUpdateAsync();
            console.log('Restarting app');

            SnackbarUtil.show({
              message: t('common.update.restartprompt'),
              button1: t('common.update.restartbutton'),
              button1Callback: () => {
                AppPersistence.clearOfflineData().then(() => {
                  Updates.reloadAsync()
                      .then((r) => console.log('Restart triggered', r))
                      .catch((e) => console.error('Restarting failed', e));
                });
              },
            });
          } else {
            console.log('No updates available');
          }
        };
        updateAsync();
      }
    })();
  }, []);

  // Render either the main-app stack or the login flow under a single "default"
  // base screen, so deep-link routes resolve against the right stack at runtime.
  const AuthenticationNavigator = useCallback(
      () => (loggedIn ? <MainStackNavigation /> : <LoginStackNavigation />),
      [loggedIn],
  );

  const BaseNavigator = () => (
    isLoading ? <SplashScreen /> :
      <BaseStack.Navigator screenOptions={{headerShown: false}}>
        <BaseStack.Screen
          name='default'
          component={AuthenticationNavigator}
        />
        <BaseStack.Screen
          name='AccountActivationScreen'
          component={AccountActivationScreen}
        />
        <BaseStack.Screen
          name='PasswordResetScreen'
          component={PasswordResetScreen}
        />
        <BaseStack.Screen
          name='TermsOfServiceScreen'
          component={TermsOfServiceScreen}
          options={{headerShown: true, title: t('screens.login.toc')}}
        />
      </BaseStack.Navigator>
  );

  return (
    <>
      <StatusBar />
      <NavigationContainer
        linking={{
          prefixes: [createURL('/'), 'https://beta.cookpal.io/'],
          config: {
            screens: {
              AccountActivationScreen: 'activateAccount',
              PasswordResetScreen: 'resetPassword',
              TermsOfServiceScreen: 'tos',
              default: {
                screens: {
                  LoginScreen: 'login',
                  SignupScreen: 'signup',
                  RequestPasswordResetScreen: 'requestResetPassword',
                  RecipeScreen: 'recipe',
                  RecipeWizardScreen: 'editRecipe',
                  ImportScreen: 'import',
                  OverviewScreen: {
                    screens: {
                      SettingsScreen: 'settings',
                      WeeklyScreen: 'weekly',
                      RecipesListScreen: {
                        screens: {
                          RecipeListDetailScreen: 'myRecipes',
                        },
                      },
                    },
                  },
                },
              },
            },
          // The linking config mixes BaseNavigatorProps + nested stack routes; the
          // generated PathConfig type doesn't model that union, so cast to any here.
          } as any,
        }}
      >
        <BaseNavigator/>
      </NavigationContainer>
    </>
  );
};

export default MainNavigation;
