import React from 'react';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Layout } from "@ui-kitten/components";
import { MainNavigationProps } from "../navigation/NavigationRoutes";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = () => {
    return (
        <Layout/>
    );
}