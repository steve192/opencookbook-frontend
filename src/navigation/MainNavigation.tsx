import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createURL} from 'expo-linking';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import {Appbar, withTheme} from 'react-native-paper';
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
import NetInfo from '@react-native-community/netinfo';
import * as Updates from 'expo-updates';
import {changeOnlineState} from '../redux/features/settingsSlice';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import AppPersistence from '../AppPersistence';
import {StatusBar} from 'expo-status-bar';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';


const Stack = createNativeStackNavigator();
const BottomTab = createMaterialBottomTabNavigator();
const MainNavigation = () => {
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();

  const [initializersRun, setInitializersRun] = useState(false);

  const {t} = useTranslation('translation');
  const theme = useAppTheme();

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
      // Do update asynchronously
        const updateAsync = async () => {
          console.log('Update check');
          await new Promise((r) => setTimeout(r, 1000));
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log('Dowload update');
            await Updates.fetchUpdateAsync();
            console.log('Restarting app');

            SnackbarUtil.show({message: t('common.update.restartprompt'), button1: t('common.update.restartbutton'), button1Callback: () => {
              AppPersistence.clearOfflineData().then(() => {
                Updates.reloadAsync()
                    .then((r) => console.log('Restart triggered', r))
                    .catch((e) => console.error('Restarting failed', e));
              });
            }});
          } else {
            console.log('No updates available');
          }
        };
        updateAsync();
      }
    })();
  }, []);

  const LoginStackNavigation = () => (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{headerShown: false}} />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{headerShown: false}} />
        <Stack.Screen
          name='RequestPasswordResetScreen'
          component={RequestPasswordResetScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </>
  );

  const MainStackNavigation = () => {
    return (
      <>
        <KeyboardAvoidingView
          // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={CentralStyles.fullscreen}
        >
          <Stack.Navigator
            screenOptions={{
              header: (nav) => (
                <Appbar.Header style={{backgroundColor: theme.colors.primary}}>
                  {nav.back ? (
                  <Appbar.BackAction color={theme.colors.onPrimary} onPress={() => nav.navigation.goBack()} />
                ) : null}
                  {nav.options.headerLeft !== undefined ? nav.options?.headerLeft?.({tintColor: undefined, canGoBack: false}): null}
                  <Appbar.Content color={theme.colors.onPrimary} title={nav.options.title} />
                  {/* TODO: Use canGoback*/}
                  {nav.options.headerRight !== undefined ? nav.options?.headerRight?.({tintColor: undefined, canGoBack: false}): null}
                </Appbar.Header>
              ),
            }}>
            <Stack.Screen
              name="OverviewScreen"
              component={BottomTabNavigation}
            />
            <Stack.Screen
              name="RecipeWizardScreen"
              component={RecipeWizardScreen}
            />
            <Stack.Screen
              name="RecipeImportBrowser"
              component={RecipeImportBrowser}
              options={{
                title: t('navigation.screenTitleImportBrowser'),
              }}
            />
            <Stack.Screen
              name="ImportScreen"
              component={ImportScreen}
              options={{
                title: t('navigation.screenTitleImport'),
              }}
            />
            <Stack.Screen
              name="RecipeGroupEditScreen"
              component={RecipeGroupEditScreen}
              options={{
                title: t('navigation.screenTitleCreateRecipeGroup'),
              }}
            />
            <Stack.Screen
              name="GuidedCookingScreen"
              component={GuidedCookingScreen}
              options={{
                title: t('navigation.screenTitleGuidedCooking'),
              }}
            />
            <Stack.Screen
              name="RecipeScreen"
              component={RecipeScreen}
            // options={
              //     { headerTransparent: true, headerStyle: {} }
              // }
            />
          </Stack.Navigator>
        </KeyboardAvoidingView>
      </>
    );
  };


  const BottomTabNavigation = withTheme(() => {
    return (

      <BottomTab.Navigator
        backBehavior="history"
        labeled={true}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.onSurface}
        activeIndicatorStyle={{
          backgroundColor: 'rgba(0,0,0,0)',
        }}
        barStyle={{
          backgroundColor: theme.colors.surface,
        }}
      >
        <BottomTab.Screen
          name="RecipesListScreen"
          component={recipeScrenNavigation}
          options={{
            title: t('screens.overview.myRecipes'),
            tabBarIcon: 'home',
          }} />
        <BottomTab.Screen
          name="WeeklyScreen"
          component={WeeklyRecipeListScreen}
          options={{
            title: t('screens.weekplan.screenTitle'),
            tabBarIcon: 'calendar',
          }} />
        <BottomTab.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{title: t('screens.settings.screenTitle'),
            tabBarIcon: 'cog-off-outline',
          }} />

      </BottomTab.Navigator>
    );
  });

  const recipeScrenNavigation = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="RecipeListDetailScreen"
        component={RecipeListScreen}
        options={{headerShown: false}} />
    </Stack.Navigator>
  );

  const BaseNavigator = () => (
    // This basically is an interceptor before the linking is resolved in the "normal" stack ("default" route)
    <>
      <StatusBar translucent={true}/>
      <Stack.Navigator
        screenOptions={{headerShown: false}}>
        <Stack.Screen
          name='default'
          component={authentificationNavigator}
        />
        <Stack.Screen
          name='AccountActivationScreen'
          component={AccountActivationScreen}
        />
        <Stack.Screen
          name='PasswordResetScreen'
          component={PasswordResetScreen}
        />
        <Stack.Screen
          name='TermsOfServiceScreen'
          component={TermsOfServiceScreen}
          options={{headerShown: true, title: t('screens.login.toc')}}
        />
      </Stack.Navigator>
    </>
  );

  const authentificationNavigator = () => (
    isLoading ? <SplashScreen /> : loggedIn ? <MainStackNavigation /> : <LoginStackNavigation />
  );

  return (
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
        },
      }}
    >
      <BaseNavigator/>
    </NavigationContainer>
  );
};

export default MainNavigation;
