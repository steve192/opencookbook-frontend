import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createURL} from 'expo-linking';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, useTheme, withTheme} from 'react-native-paper';
import {useAppSelector} from '../redux/hooks';
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


const Stack = createNativeStackNavigator();
const BottomTab = createMaterialBottomTabNavigator();
const MainNavigation = () => {
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);


  const {t} = useTranslation('translation');
  const theme = useTheme();

  const LoginStackNavigation = () => (
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
  );

  const MainStackNavigation = () => {
    return (
      <>
        <Stack.Navigator
          screenOptions={{
            header: (nav) => (
              <Appbar.Header>
                {nav.back ? (
                  <Appbar.BackAction color={theme.colors.textOnPrimary} onPress={() => nav.navigation.goBack()} />
                ) : null}
                <Appbar.Content color={theme.colors.textOnPrimary} title={nav.options.title} />
                {nav.options.headerRight !== undefined ? nav.options?.headerRight?.({tintColor: undefined}): null}
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
      </>
    );
  };


  const BottomTabNavigation = withTheme(() => {
    return (

      <BottomTab.Navigator
        backBehavior="history"
        labeled={true}
        activeColor={theme.colors.primary}
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
