import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Divider, Layout, Text, useTheme } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import Spacer from "react-spacer";
import { EditIcon, MinusIcon, PlusIcon } from "../assets/Icons";
import { RecipeImageViewPager } from "../components/RecipeImageViewPager";
import { TextBullet } from "../components/TextBullet";
import RestAPI, { Recipe } from "../dao/RestAPI";
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import { fetchSingleRecipe } from "../redux/features/recipesSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import CentralStyles from "../styles/CentralStyles";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {

    const [servings, setServings] = useState<number>(0);
    var displayedRecipe = useAppSelector(state => state.recipes.recipes.filter(recipe => recipe.id === props.route.params.recipeId)[0]);
    const { t } = useTranslation("translation");
    const dispatch = useAppDispatch();

    props.navigation.setOptions({ title: displayedRecipe ? displayedRecipe.title : "Loading" });
    // useLayoutEffect(() => {

    props.navigation.setOptions({
        headerRight: () => (
            <Button
                onPress={() => props.navigation.navigate("RecipeWizardScreen", {
                    editing: true,
                    recipe: displayedRecipe,
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
        dispatch(fetchSingleRecipe(props.route.params.recipeId));
    }, [props.route.params.recipeId]);

    const theme = useTheme();

    const getServingMultiplier = () => {
        if (!displayedRecipe) {
            return 1;
        }
        return servings / displayedRecipe?.servings;
    }

    const scaleIngredient = (originalAmount: number) => {
        return Math.round(originalAmount * getServingMultiplier() * 10) / 10;
    }

    const renderIngredientsSection = () => (
        <>
            <Text category="label">{t("screens.recipe.ingredients")}</Text>
            {/* <View style={{ flexDirection: "row", flexWrap:"wrap", justifyContent: "space-evenly" }}> */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {displayedRecipe?.neededIngredients.map(ingredient =>
                    <>
                        <Divider />
                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                            <Text style={{ flex: 2, alignSelf: 'stretch', color: theme["color-primary-default"], fontWeight: "bold" }}>{`${scaleIngredient(ingredient.amount)} ${ingredient.unit}`}</Text>
                            <Text style={{ flex: 4, alignSelf: 'stretch' }} >{ingredient.ingredient.name}</Text>
                        </View>
                    </>
                )}
            </View>
            <Spacer height={20} />
            <View style={styles.servingsContainer}>
                <Button
                    style={CentralStyles.iconButton}
                    size='tiny'
                    onPress={() => {
                        if (servings === 1) {
                            return;
                        }
                        setServings(
                            servings - 1);
                    }}
                    accessoryLeft={<MinusIcon />} />
                <Text style={{ paddingHorizontal: 20 }}> {servings} {t("screens.recipe.servings")}</Text>
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
            <Text category="label">{t("screens.recipe.preparationSteps")}</Text>
            <Spacer height={20} />
            {displayedRecipe && displayedRecipe.preparationSteps.map((preparationStep, index) => (
                <>
                    <Divider />
                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                        <TextBullet
                            value={(index + 1).toString()} />
                        <Text style={{ flex: 1 }}>{preparationStep}</Text>
                    </View>
                </>
            ))}
        </>
    );


    return (
        <>
            {/* <StatusBar /> */}
            <Layout style={CentralStyles.fullscreen}>
                <ScrollView>
                    <RecipeImageViewPager
                        style={{ height: 320 }}
                        images={displayedRecipe ? displayedRecipe?.images : []}
                    />
                    <View style={[CentralStyles.contentContainer, { flex: 1 }]} >
                        {displayedRecipe && renderIngredientsSection()}

                        <Spacer height={20} />
                        <Button onPress={() => displayedRecipe && props.navigation.navigate("GuidedCookingScreen", { recipe: displayedRecipe })}>{t("screens.recipe.startCookingButton")}</Button>
                        <Spacer height={20} />

                        {displayedRecipe && renderStepsSection()}

                    </View>
                </ScrollView>
            </Layout>
        </>
    );
}

const styles = StyleSheet.create({
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

