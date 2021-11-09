import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Divider, Layout, Text, useTheme } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import Spacer from "react-spacer";
import { EditIcon, MinusIcon, PlusIcon } from "../assets/Icons";
import { RecipeImageViewPager } from "../components/RecipeImageViewPager";
import RestAPI, { Recipe } from "../dao/RestAPI";
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import CentralStyles from "../styles/CentralStyles";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {

    const [servings, setServings] = useState<number>(0);
    const [recipe, setRecipe] = useState<Recipe>();

    props.navigation.setOptions({ title: recipe ? recipe.title : "Loading" });
    // useLayoutEffect(() => {

    props.navigation.setOptions({
        headerRight: () => (
            <Button
                onPress={() => props.navigation.navigate("RecipeWizardScreen", {
                    editing: true,
                    recipe: recipe,
                    onRecipeChanged: setRecipe,
                    onRecipeDeleted: () => {
                        props.navigation.goBack();
                        if (props.route.params.onRecipeChanged) {
                            props.route.params.onRecipeChanged();
                        }
                    }
                })} accessoryLeft={<EditIcon />} />
        ),
    });
    // }, [props.navigation]);
    useEffect(() => {
        RestAPI.getRecipeById(props.route.params.recipeId)
            .then((loadedRecipe) => {
                setRecipe(loadedRecipe);
                setServings(loadedRecipe.servings);
            });
    }, [props.route.params.recipeId]);

    const theme = useTheme();

    const getServingMultiplier = () => {
        if (!recipe) { return 1 };
        return servings / recipe?.servings;
    }

    const renderIngredientsSection = () => (
        <>
            <Text category="label">Ingredients</Text>
            {/* <View style={{ flexDirection: "row", flexWrap:"wrap", justifyContent: "space-evenly" }}> */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {recipe?.neededIngredients.map(ingredient =>
                    <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                        <Text style={{ flex: 1, alignSelf: 'stretch', color: theme["color-primary-default"], fontWeight: "bold" }}>{`${ingredient.amount * getServingMultiplier()} ${ingredient.unit}`}</Text>
                        <Text style={{ flex: 3, alignSelf: 'stretch' }} >{ingredient.ingredient.name}</Text>
                    </View>
                )}
            </View>
            <Spacer height={20} />
            <View style={styles.servingsContainer}>
                <Button
                    style={CentralStyles.iconButton}
                    size='tiny'
                    onPress={() => setServings(servings - 1)}
                    accessoryLeft={<MinusIcon />} />
                <Text style={{ paddingHorizontal: 20 }}> {servings} Servings</Text>
                <Button
                    style={CentralStyles.iconButton}
                    size='tiny'
                    onPress={() => setServings(servings + 1)}
                    accessoryLeft={<PlusIcon />} />
            </View>
            {/* </View> */}
        </>
    )

    const renderStepsSection = () => (
        <>
            <Text category="label">Preparation steps</Text>
            <Spacer height={20} />
            {recipe && recipe.preparationSteps.map((preparationStep, index) => (
                <>
                    <Divider />
                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <View style={styles.textBulletContrainer}>
                            <Text style={styles.textBullet}>{index + 1}</Text>
                        </View>
                        <Text style={{ flex: 1 }}>{preparationStep}</Text>
                    </View>
                </>
            ))}
        </>
    );


    return (
        <>
            {/* <StatusBar /> */}
            <Layout>
                <ScrollView>
                    <RecipeImageViewPager
                        style={{ height: 320 }}
                        images={recipe ? recipe?.images : []}
                    />
                    <View style={[CentralStyles.contentContainer, { flex: 1 }]} >
                        {recipe && renderIngredientsSection()}

                        <Spacer height={20} />
                        <Button>Start cooking</Button>
                        <Spacer height={20} />

                        {recipe && renderStepsSection()}

                    </View>
                </ScrollView>
            </Layout>
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
    servingsContainer: {

        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',

    },
});

