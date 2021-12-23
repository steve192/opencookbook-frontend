import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BottomNavigation, BottomNavigationTab, useTheme} from '@ui-kitten/components';
import {createURL} from 'expo-linking';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {CalendarIcon, HomeIcon, SettingsIcon} from '../assets/Icons';
import {useAppSelector} from '../redux/hooks';
import {GuidedCookingScreen} from '../screens/GuidedCookingScreen';
import {ImportScreen} from '../screens/ImportScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import {SignupScreen} from '../screens/LoginScreen/SignupScreen';
import {SplashScreen} from '../screens/LoginScreen/SplashScreen';
import {RecipeGroupEditScreen} from '../screens/RecipeGroupEditScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import {RecipeScreen} from '../screens/RecipeScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {WeeklyRecipeListScreen} from '../screens/weeklyrecipelist/WeeklyRecipeListScreen';
import RecipeWizardScreen from '../screens/wizard/RecipeWizardScreen';


const MainNavigation = () => {
  const theme = useTheme();
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const Stack = createNativeStackNavigator();

  const {t} = useTranslation('translation');

  const LoginStackNavigation = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: theme['color-primary-default']},
          headerTintColor: theme['text-alternate-color'],
        }}>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{headerShown: false}} />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{headerShown: false}} />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );

  const MainStackNavigation = () => {
    return (
      <>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {backgroundColor: theme['color-primary-default']},
              headerTintColor: theme['text-alternate-color'],
            }}>
            <Stack.Screen
              name="OverviewScreen"
              component={BottomTabNavigation}
              options={
                {headerShown: false}
              }
            />
            <Stack.Screen
              name="RecipeWizardScreen"
              component={RecipeWizardScreen}
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

  const BottomTab = createBottomTabNavigator();

  const BottomTabBar = (props: BottomTabBarProps) => (
    <>
      <BottomNavigation
        selectedIndex={props.state.index}
        onSelect={(index) => props.navigation.navigate(props.state.routeNames[index])}>
        <BottomNavigationTab title={t('navigation.tabMyRecipes')} icon={<HomeIcon />} />
        <BottomNavigationTab title={t('navigation.tabWeekplan')} icon={<CalendarIcon />} />
        <BottomNavigationTab title={t('navigation.tabSettings')} icon={<SettingsIcon />} />
      </BottomNavigation>
    </>
  );


  const BottomTabNavigation = () => {
    return (
      <BottomTab.Navigator
        backBehavior="history"
        screenOptions={{
          headerStyle: {backgroundColor: theme['color-primary-default']},
          headerTintColor: theme['text-alternate-color'],
        }}
        tabBar={(props) => <BottomTabBar {...props} />}>
        <BottomTab.Screen
          name="RecipesListScreen"
          component={recipeScrenNavigation}
          options={{headerShown: false}} />
        <BottomTab.Screen
          name="WeeklyScreen"
          component={WeeklyRecipeListScreen}
          options={{title: t('screens.weekplan.screenTitle'), headerShown: true}} />
        <BottomTab.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{title: t('screens.settings.screenTitle'), headerShown: true}} />

      </BottomTab.Navigator>
    );
  };

  const recipeScrenNavigation = () => (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme['color-primary-default']},
        headerTintColor: theme['text-alternate-color'],
      }}>
      <Stack.Screen
        name="RecipeListDetailScreen"
        component={RecipeListScreen}
        options={{headerShown: true}} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer
      linking={{

        prefixes: [createURL('/')],
      }}
    >
      {isLoading ? <SplashScreen /> : loggedIn ? <MainStackNavigation /> : <LoginStackNavigation />}
    </NavigationContainer>
  );
};

export default MainNavigation;
