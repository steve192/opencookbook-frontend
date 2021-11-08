import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import { Avatar, Button, Divider, Text, useTheme, ViewPager } from '@ui-kitten/components';
import { StatusBar } from "../components/StatusBar";
import CentralStyles from "../styles/CentralStyles";
import { ScrollView } from "react-native-gesture-handler";
import Spacer from "react-spacer";
import { EditIcon, MinusIcon, PlusIcon } from "../assets/Icons";
import RestAPI, { Recipe } from "../dao/RestAPI";
import { RecipeImageViewPager } from "../components/RecipeImageViewPager";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {

    const [portions, setPortions] = useState<number>(1);
    const [recipe, setRecipe] = useState<Recipe>();

    props.navigation.setOptions({ title: recipe ? recipe.title : "Loading" });
    // useLayoutEffect(() => {

        props.navigation.setOptions({
            headerRight: () => (
                <Button onPress={() => props.navigation.navigate("RecipeWizardScreen", { editing: true, recipe: getRecipe() })} accessoryLeft={<EditIcon />} />
            ),
        });
    // }, [props.navigation]);
    useEffect(() => {
        RestAPI.getRecipeById(props.route.params.recipeId)
            .then(setRecipe);
    }, [props.route.params.recipeId]);

    const getRecipe = () => {
        return recipe;
    }

    const theme = useTheme();

    const renderIngredientsSection = () => (
        <>
            <Text category="label">Ingredients</Text>
            {/* <View style={{ flexDirection: "row", flexWrap:"wrap", justifyContent: "space-evenly" }}> */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {recipe ? recipe.neededIngredients.map(ingredient =>
                    <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                        <Text style={{ flex: 1, alignSelf: 'stretch', color: theme["color-primary-default"], fontWeight: "bold" }}>{`${ingredient.amount} ${ingredient.unit}`}</Text>
                        <Text style={{ flex: 3, alignSelf: 'stretch' }} >{ingredient.ingredient.name}</Text>
                    </View>
                ) : null}
            </View>
            <Spacer height={20} />
            <View style={styles.portionsContainer}>
                <Button
                    style={CentralStyles.iconButton}
                    size='tiny'
                    onPress={() => setPortions(portions - 1)}
                    accessoryLeft={<MinusIcon />} />
                <Text style={{ paddingHorizontal: 20 }}> {portions} Portions</Text>
                <Button
                    style={CentralStyles.iconButton}
                    size='tiny'
                    onPress={() => setPortions(portions + 1)}
                    accessoryLeft={<PlusIcon />} />
            </View>
            {/* </View> */}
        </>
    )

    const renderStepsSection = () => (
        <>
            <Text category="label">Preparation steps</Text>
            <Spacer height={20} />
            {recipe ? recipe.preparationSteps.map((preparationStep, index) => (
                <>
                    <Divider />
                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <View style={styles.textBulletContrainer}>
                            <Text style={styles.textBullet}>{index + 1}</Text>
                        </View>
                        <Text style={{ flex: 1 }}>{preparationStep}</Text>
                    </View>
                </>
            )) : null}
        </>
    );


    return (
        <>
            {/* <StatusBar /> */}
            <ScrollView>
                <RecipeImageViewPager
                    style={{ height: 320 }}
                    images={recipe ? recipe?.images : []}
                />
                <View style={[CentralStyles.contentContainer, { flex: 1 }]} >
                    {renderIngredientsSection()}

                    <Spacer height={20} />
                    <Button>Start cooking</Button>
                    <Spacer height={20} />

                    {renderStepsSection()}

                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    textBulletContrainer: {
        borderColor: "green",
        borderWidth: 2,
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    textBullet: {
        color: "green",
        fontWeight: "bold"
    },
    recipeImage: {
        width: "100%",
        height: 320,
        borderRadius: 0,
    },
    portionsContainer: {

        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',

    },
});

