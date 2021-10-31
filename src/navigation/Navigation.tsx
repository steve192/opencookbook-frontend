import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FaCalendarWeek, FaThList } from 'react-icons/fa';
import { BottomTabBarOptions, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ApplicationProvider, BottomNavigation, BottomNavigationTab, Button, Drawer, DrawerItem, IndexPath } from '@ui-kitten/components';
import RecipeListScreen from '../screens/RecipeListScreen';
import WeeklyRecipeListScreen from '../screens/WeeklyRecipeListScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RecipeWizardScreen from '../screens/RecipeWizardScreen';
import { RecipeScreen } from '../screens/RecipeScreen';

const MainNavigation = () => {
    return (
        <StackNavigator />
    )
}

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true
            }}>
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false}}/>
            <Stack.Screen
                name="OverviewScreen"
                component={BottomTabNavigation}
                options={{ title: 'Opencookbook' }}
            />
            <Stack.Screen
                name="RecipeWizardScreen"
                component={RecipeWizardScreen}
            />
            <Stack.Screen
                name="RecipeScreen"
                component={RecipeScreen}
            />
        </Stack.Navigator>
    );
}

const BottomTab = createBottomTabNavigator();

const BottomTabBar = (props: BottomTabBarProps<BottomTabBarOptions>) => (
    <BottomNavigation
        selectedIndex={props.state.index}
        onSelect={index => props.navigation.navigate(props.state.routeNames[index])}>
        <BottomNavigationTab title='MY RECIPES' />
        <BottomNavigationTab title='WEEKPLAN' />
    </BottomNavigation>
);



const BottomTabNavigation = () => {
    return (
        <BottomTab.Navigator tabBar={props => <BottomTabBar {...props} />}>
            <BottomTab.Screen
                name="RecipesListScreen"
                component={RecipeListScreen}
                options={{ title: "RECIPES", tabBarIcon: FaThList }} />
            <BottomTab.Screen
                name="WeeklyScreen"
                component={WeeklyRecipeListScreen}
                options={{ title: "Weekly", tabBarIcon: FaCalendarWeek }} />

        </BottomTab.Navigator>
    );
}


export default MainNavigation;
