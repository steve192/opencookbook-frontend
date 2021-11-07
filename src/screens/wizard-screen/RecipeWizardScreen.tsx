import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, Button, Icon, Input, Text, ViewPager } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { ImageProps, ScrollView, StyleSheet, View } from 'react-native';
import Spacer from 'react-spacer';
import { RecipeImageViewPager } from '../../components/RecipeImageViewPager';
import RestAPI, { IngredientUse, Recipe } from '../../dao/RestAPI';
import { MainNavigationProps } from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import { IngredientFormField } from './IngridientFromField';
import { RecipeFormField } from './PreparationStepFormField';




type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;
const RecipeWizardScreen = (props: Props) => {

    let [newRecipeData, setNewRecipeData] = useState<Recipe>({
        title: "",
        neededIngredients: [{ ingredient: { name: "" }, amount: 0, unit: "" }],
        preparationSteps: [""],
        images: []
    });


   

    const AddIcon = (props: Partial<ImageProps> | undefined) => (
        <Icon {...props} name="plus-outline" />
    );

    const changePreparationStep = (newText: string, index: number) => {
        let preparationStepsCopy = newRecipeData.preparationSteps;
        preparationStepsCopy[index] = newText;
        setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
    }

    const addPreparationStep = () => {
        let preparationStepsCopy = newRecipeData.preparationSteps;
        preparationStepsCopy.push("");
        setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
    }

    const removePreparationStep = (index: number) => {
        let preparationStepsCopy = newRecipeData.preparationSteps;
        preparationStepsCopy.splice(index, 1);
        setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
    }


    const removeIngredient = (index: number) => {
        let ingredientsCopy = newRecipeData.neededIngredients;
        ingredientsCopy.splice(index, 1);
        setNewRecipeData({ ...newRecipeData, neededIngredients: ingredientsCopy })
    }

    const addRecipeImage = (uuid: string) => {
        let images = newRecipeData.images;
        images.push({ uuid })
        setNewRecipeData({ ...newRecipeData, images: images })
    }

    const addIngredient = () => {
        let ingredientsCopy = newRecipeData.neededIngredients;
        ingredientsCopy.push({
            ingredient: { id: undefined, name: "" },
            unit: "",
            amount: 1
        });
        setNewRecipeData({ ...newRecipeData, neededIngredients: ingredientsCopy })
    }

    const changeIngredient = (index: number, ingredient: IngredientUse) => {
        let ingredientsCopy = newRecipeData.neededIngredients;
        ingredientsCopy[index] = ingredient
        setNewRecipeData({ ...newRecipeData, neededIngredients: ingredientsCopy })
    }



    const createNewRecipe = () => {
        RestAPI.createNewRecipe(newRecipeData).then(() => props.navigation.goBack());
    };

    const renderIngredientsSection = () =>
        <>
            <Text category="label">Ingredients</Text>
            {newRecipeData.neededIngredients.map((neededIngredient, ingredientIndex) =>
                <IngredientFormField
                    key={ingredientIndex + "ingredient"}
                    ingredient={neededIngredient}
                    onIngredientChange={(ingredient) => changeIngredient(ingredientIndex, ingredient)}
                    onRemovePress={() => removeIngredient(ingredientIndex)} />
            )}
            <Button size="small" key="addIngredient" accessoryLeft={AddIcon} onPress={addIngredient} />
        </>


    const renderPreparationStepsSection = () =>
        <>
            {newRecipeData.preparationSteps.map((preparationStep, preparationStepIndex) =>
                <RecipeFormField
                    onRemovePress={() => removePreparationStep(preparationStepIndex)}
                    key={preparationStepIndex + "prepstep"}
                    multiline={true}
                    numberOfLines={5}
                    value={newRecipeData.preparationSteps[preparationStepIndex]}
                    onChangeText={newText => changePreparationStep(newText, preparationStepIndex)}
                    placeholder="Add description of preparation step..." />
            )}
            <Button size="small" key="addStep" accessoryLeft={AddIcon} onPress={addPreparationStep} />
        </>

   

    return (
        <>
            <View style={styles.contentContainer}>
                <ScrollView>
                    <RecipeImageViewPager
                        onImageAdded={addRecipeImage}
                        images={newRecipeData.images}
                        allowEdit={true}
                    />
                    <View style={[styles.formContainer, CentralStyles.elementSpacing]}>
                        <Text category="label">Title</Text>
                        <Input
                            value={newRecipeData.title}
                            onChangeText={(newText) => setNewRecipeData({ ...newRecipeData, title: newText })}
                            placeholder="Name" />
                        <Spacer height={10} />
                        {renderIngredientsSection()}
                        <Spacer height={10} />
                        <Text category="label">Preparation Steps</Text>
                        {renderPreparationStepsSection()}
                    </View>
                    <Button
                        size="giant"
                        onPress={() => createNewRecipe()}>Create</Button>
                </ScrollView>
            </View>
        </>
    )



}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    formContainer: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    }
});







export default RecipeWizardScreen;