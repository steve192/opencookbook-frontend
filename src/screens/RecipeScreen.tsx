import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import { Avatar, Button, Text, useTheme, ViewPager } from '@ui-kitten/components';
import { StatusBar } from "../components/StatusBar";
import CentralStyles from "../styles/CentralStyles";
import { ScrollView } from "react-native-gesture-handler";
import Spacer from "react-spacer";
import { MinusIcon, PlusIcon } from "../assets/Icons";
import RestAPI, { Recipe } from "../dao/RestAPI";
import { RecipeImageViewPager } from "../components/RecipeImageViewPager";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {

    const [portions, setPortions] = useState<number>(1);
    const [recipe, setRecipe] = useState<Recipe>();

    props.navigation.setOptions({ title: recipe ? recipe.title : "Loading" });
    useEffect(() => {
        RestAPI.getRecipeById(props.route.params.recipeId)
            .then(setRecipe);
    }, [props.route.params.recipeId]);

    const theme = useTheme();

    const renderIngredientsSection = () => (
        <>
            <Text category="label">Ingredients</Text>
            <View style={{ flexDirection: "row", flexWrap:"wrap" }}>
                <View style={{  }}>
                    {recipe ? recipe.neededIngredients.map(ingredient =>
                        <View style={{ display: "flex", flexDirection:"row", alignItems: "stretch"}}>
                            <Text style={{ flexGrow: 1, color: theme["color-primary-default"], fontWeight: "bold" }}>{`${ingredient.amount} ${ingredient.unit}`}</Text>
                            <Text style={{flexGrow: 1}} >{ingredient.ingredient.name}</Text>
                        </View>
                    ) : null}
                </View>

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
            </View>
        </>
    )

    const renderStepsSection = () => (
        <>
            <Text category="label">Preparation steps</Text>
            {recipe ? recipe.preparationSteps.map((preparationStep, index) => (
                <>
                    <View style={{ flex: 1, flexDirection: "row", paddingVertical: 10, alignItems: "center" }}>
                        <View style={styles.textBulletContrainer}>
                            <Text style={styles.textBullet}>{index + 1}</Text>
                        </View>
                        <Text>{preparationStep}</Text>
                    </View>
                </>
            )) : null}
        </>
    );


    return (
        <>
            <StatusBar />
            <ScrollView>
                <RecipeImageViewPager
                    images={recipe ? recipe?.images : []}
                />
                <View style={CentralStyles.contentContainer} >
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

