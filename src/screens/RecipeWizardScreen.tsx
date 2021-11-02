import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, Button, Icon, Input, Text, StyleService, ViewPager } from '@ui-kitten/components';
import React, { useState } from 'react';
import { ImageProps, View } from 'react-native';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import RestAPI, { Recipe } from '../dao/RestAPI';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';




type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;
const RecipeWizardScreen = (props: Props) => {

    let [currentStep, setCurrentStep] = useState(0);
    let [newRecipeData, setNewRecipeData] = useState<Recipe>({ title: "", neededIngredients: [{ ingredient: { id: 0, name: "" }, amount: 0, unit: "" }], preparationSteps: [""] });

    const AddIcon = (props: Partial<ImageProps> | undefined) => (
        <Icon {...props} name="plus-outline" />
    );

    const changeRecipeStep = (newText: string, index: number) => {
        let preparationStepsCopy = newRecipeData.preparationSteps;
        preparationStepsCopy[index] = newText;
        setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
    }

    const addPreparationStep = () => {
        let preparationStepsCopy = newRecipeData.preparationSteps;
        preparationStepsCopy.push("");
        setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
    }

    const getWizardStep = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <View style={styles.contentContainer}>
                        <ScrollView>
                            <View style={[styles.recipeImageContainer]}>
                                <ViewPager
                                    selectedIndex={0}
                                    style={styles.recipeImage}>
                                    <Avatar
                                        key={0 + "image"}
                                        source={require('../assets/placeholder.png')}
                                        style={styles.recipeImage} />
                                </ViewPager>
                                <Button style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
                            </View>
                            <View style={[styles.formContainer, CentralStyles.elementSpacing]}>
                                <Input
                                    value={newRecipeData.title}
                                    onChangeText={(newText) => setNewRecipeData({ ...newRecipeData, title: newText })}
                                    placeholder="Name" />
                                <Text>Ingredients</Text>
                                {newRecipeData.neededIngredients.map((neededIngredient, ingredientIndex) => 
                                    <>
                                        <Input
                                            key={ingredientIndex + "name"}
                                            value={neededIngredient.ingredient.name}
                                            placeholder="Ingredient name" />
                                        <Input
                                            key={ingredientIndex + "amountUnit"}
                                            value={neededIngredient.amount.toString() + " " + neededIngredient.unit}
                                            placeholder="Amount and Unit" />

                                        {ingredientIndex === newRecipeData.neededIngredients.length - 1 ? <Button key="addIngredient" accessoryLeft={AddIcon} onPress={addPreparationStep} /> : null}
                                    </>
                                )}

                                <Text>Preparation Steps</Text>
                                {newRecipeData.preparationSteps.map((preparationStep, preparationStepIndex) =>
                                    <>
                                        <Input
                                            key={preparationStepIndex + "prepstep"}
                                            multiline={true}
                                            value={newRecipeData.preparationSteps[preparationStepIndex]}
                                            onChangeText={newText => changeRecipeStep(newText, preparationStepIndex)}
                                            placeholder="Add description of preparation step..." />
                                        {preparationStepIndex === newRecipeData.preparationSteps.length - 1 ? <Button key="addStep" accessoryLeft={AddIcon} onPress={addPreparationStep} /> : null}
                                    </>
                                )}
                            </View>
                        </ScrollView>
                        <Button
                            size="giant"
                            onPress={() => createNewRecipe()}>Create</Button>
                    </View>
                )

            case 1:
                return (
                    <View style={styles.contentContainer}>
                        <ScrollView style={CentralStyles.scrollView}>

                        </ScrollView>

                    </View>
                )
        }
    };

    const createNewRecipe = () => {
        RestAPI.createNewRecipe(newRecipeData);
        alert(JSON.stringify(newRecipeData));
    };

    return (
        <>
            <View style={{ flex: 1 }}>
                {getWizardStep(currentStep)}
            </View>
        </>
    )



}

const styles = StyleSheet.create({
    recipeImageContainer: {
        alignSelf: 'center',
        width: "100%",
        height: 320,
        borderRadius: 16,
    },
    recipeImage: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
    },
    imageButton: {
        position: "absolute",
        alignSelf: "flex-end",
        bottom: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'grey'
    },
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