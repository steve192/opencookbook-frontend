import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavigation, BottomNavigationTab, useTheme } from '@ui-kitten/components';
import React from 'react';
import { FaCalendarWeek, FaThList } from 'react-icons/fa';
import LoginScreen from '../screens/LoginScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import { RecipeScreen } from '../screens/RecipeScreen';
import RecipeWizardScreen from '../screens/wizard-screen/RecipeWizardScreen';
import WeeklyRecipeListScreen from '../screens/WeeklyRecipeListScreen';



const MainNavigation = () => {
    const theme = useTheme();


    const Stack = createNativeStackNavigator();
    const StackNavigator = () => {
        return (
            <>
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
                    name="RecipeScreen"
                    component={RecipeScreen}
                    options={
                        { headerTransparent: true, headerStyle: {} }
                    }
                />
            </Stack.Navigator>
            </>
        );
    }

    const BottomTab = createBottomTabNavigator();

    const BottomTabBar = (props: BottomTabBarProps) => (
        <>
            <BottomNavigation
                selectedIndex={props.state.index}
                onSelect={index => props.navigation.navigate(props.state.routeNames[index])}>
                <BottomNavigationTab title='MY RECIPES' />
                <BottomNavigationTab title='WEEKPLAN' />
            </BottomNavigation>
        </>
    );



    const BottomTabNavigation = () => {
        return (
            <BottomTab.Navigator
                tabBar={props => <BottomTabBar {...props} />}>
                <BottomTab.Screen
                    name="RecipesListScreen"
                    component={RecipeListScreen}
                    options={{ title: "RECIPES", tabBarIcon: FaThList, headerShown: false }} />
                <BottomTab.Screen
                    name="WeeklyScreen"
                    component={WeeklyRecipeListScreen}
                    options={{ title: "Weekly", tabBarIcon: FaCalendarWeek, headerShown: false }} />

            </BottomTab.Navigator>
        );
    }
    return (
        <StackNavigator />
    )
}

export default MainNavigation;
