import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import { Avatar, Text, ViewPager } from '@ui-kitten/components';
import { StatusBar } from "../components/StatusBar";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = () => {

    return (
        <>
            <StatusBar />
            <ViewPager
                selectedIndex={0}
                style={styles.recipeImage}>
                <Avatar
                    key={0 + "image"}
                    source={require('../assets/placeholder.png')}
                    style={styles.recipeImage} />
            </ViewPager>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
            <Text>Recipe info here</Text>
        </>
    );
}

const styles = StyleSheet.create({

    recipeImage: {
        width: "100%",
        height: 320,
        borderRadius: 0,
    }
});