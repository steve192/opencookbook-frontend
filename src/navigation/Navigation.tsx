import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavigation, BottomNavigationTab, useTheme, Text } from '@ui-kitten/components';
import React from 'react';
import { FaCalendarWeek, FaThList } from 'react-icons/fa';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import { RecipeScreen } from '../screens/RecipeScreen';
import RecipeWizardScreen from '../screens/wizard-screen/RecipeWizardScreen';
import WeeklyRecipeListScreen from '../screens/WeeklyRecipeListScreen';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SignupScreen } from '../screens/LoginScreen/SignupScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { CalendarIcon, HomeIcon, SettingsIcon } from '../assets/Icons';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RecipeGroupEditScreen } from '../screens/RecipeGroupEditScreen';
import { GuidedCookingScreen } from '../screens/GuidedCookingScreen';
import { SplashScreen } from '../screens/LoginScreen/SplashScreen';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createURL } from 'expo-linking';



const MainNavigation = () => {
    const theme = useTheme();

    const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);

    const Stack = createNativeStackNavigator();

    const LoginStackNavigation = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: theme["color-primary-default"] },
                    headerTintColor: theme["text-alternate-color"]
                }}>
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ headerShown: false }} />
                <Stack.Screen
                    name="SignupScreen"
                    component={SignupScreen}
                    options={{ headerShown: false }} />
            </Stack.Navigator>
        </KeyboardAvoidingView>
    )

    const MainStackNavigation = () => {
        return (
            <>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}>
                    <Stack.Navigator
                        screenOptions={{
                            headerStyle: { backgroundColor: theme["color-primary-default"] },
                            headerTintColor: theme["text-alternate-color"]
                        }}>
                        <Stack.Screen
                            name="OverviewScreen"
                            component={BottomTabNavigation}
                            options={
                                { headerShown: false }
                            }
                        />
                        <Stack.Screen
                            name="RecipeWizardScreen"
                            component={RecipeWizardScreen}
                            options={{
                                title: "Create recipe"
                            }}
                        />
                        <Stack.Screen
                            name="ImportScreen"
                            component={ImportScreen}
                            options={{
                                title: "Import recipe"
                            }}
                        />
                        <Stack.Screen
                            name="RecipeGroupEditScreen"
                            component={RecipeGroupEditScreen}
                            options={{
                                title: "Create recipe group"
                            }}
                        />
                        <Stack.Screen
                            name="GuidedCookingScreen"
                            component={GuidedCookingScreen}
                            options={{
                                title: "Guided cooking"
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
    }

    const BottomTab = createBottomTabNavigator();

    const BottomTabBar = (props: BottomTabBarProps) => (
        <>
            <BottomNavigation
                selectedIndex={props.state.index}
                onSelect={index => props.navigation.navigate(props.state.routeNames[index])}>
                <BottomNavigationTab title='MY RECIPES' icon={<HomeIcon />} />
                <BottomNavigationTab title='WEEKPLAN' icon={<CalendarIcon />} />
                <BottomNavigationTab title='SETTINGS' icon={<SettingsIcon />} />
            </BottomNavigation>
        </>
    );



    const BottomTabNavigation = () => {
        return (
            <BottomTab.Navigator
                backBehavior="history"
                screenOptions={{
                    headerStyle: { backgroundColor: theme["color-primary-default"] },
                    headerTintColor: theme["text-alternate-color"],
                }}
                tabBar={props => <BottomTabBar {...props} />}>
                <BottomTab.Screen
                    name="RecipesListScreen"
                    component={recipeScrenNavigation}
                    options={{ title: "My recipes", headerShown: false }} />
                <BottomTab.Screen
                    name="WeeklyScreen"
                    component={WeeklyRecipeListScreen}
                    options={{ title: "Weekly", headerShown: true }} />
                <BottomTab.Screen
                    name="SettingsScreen"
                    component={SettingsScreen}
                    options={{ title: "Settings", headerShown: true }} />

            </BottomTab.Navigator>
        );
    }

    const recipeScrenNavigation = () => (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme["color-primary-default"] },
                headerTintColor: theme["text-alternate-color"]
            }}>
            <Stack.Screen
                name="RecipeListDetailScreen"
                component={RecipeListScreen}
                options={{ headerShown: true }} />
        </Stack.Navigator>
    )

    return (
        <NavigationContainer
            linking={{
                prefixes: [createURL('/')],
            }}
            >
            {isLoading ? <SplashScreen /> : loggedIn ? <MainStackNavigation /> : <LoginStackNavigation />}
        </NavigationContainer>
    )
}

export default MainNavigation;
