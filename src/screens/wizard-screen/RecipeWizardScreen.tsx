import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Autocomplete, AutocompleteItem, Avatar, Button, Icon, Input, Text, ViewPager } from '@ui-kitten/components';
import React, { useEffect, useMemo, useState } from 'react';
import { ImageProps, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Spacer from 'react-spacer';
import RestAPI, { Ingredient, IngredientUse, Recipe } from '../../dao/RestAPI';
import { MainNavigationProps } from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import { IngredientFormField } from './IngridientFromField';
import { RecipeFormField } from './PreparationStepFormField';
import * as ImagePicker from 'expo-image-picker';




type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;
const RecipeWizardScreen = (props: Props) => {

    let [newRecipeData, setNewRecipeData] = useState<Recipe>({
        title: "",
        neededIngredients: [{ ingredient: { name: "" }, amount: 0, unit: "" }],
        preparationSteps: [""],
        images: []
    });

    let [imageURIs, setImageURIs] = useState<{ [uuid: string]: string }>({});

    useEffect(() => {
        newRecipeData.images.forEach((image) => {
            if (!imageURIs[image.uuid]) {
                RestAPI.getImageAsDataURI(image.uuid).then((data) => {
                    setImageURIs({ ...imageURIs, [image.uuid]: data });
                }).catch((error) => {
                    alert("Error fetching image" + error);
                    //TODO: Error handling
                });
            }
        });
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

    const selectImage = async () => {
        // Ask the user for the permission to access the media library 
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({ base64: true });

        if (result.cancelled) {
            return;
        }

        await RestAPI.uploadImage(result.uri).then((uuid) => {
            addRecipeImage(uuid);
        }).catch((error) => {
            //TODO: Error handling
            alert("Error uploading picture");
        });
    };

    return (
        <>
            <View style={styles.contentContainer}>
                <ScrollView>
                    <View style={[styles.recipeImageContainer]}>
                        <ViewPager
                            selectedIndex={0}
                            style={styles.recipeImage}>

                            {newRecipeData.images.length === 0 ?
                                <Avatar
                                    source={require('../../assets/placeholder.png')}
                                    style={styles.recipeImage} /> :

                                newRecipeData.images.map((image, imageIndex) =>
                                    <Avatar
                                        key={imageIndex + "image"}
                                        source={imageURIs[image.uuid] ? { uri: imageURIs[image.uuid] } : require('../../assets/placeholder.png')}
                                        style={styles.recipeImage} />
                                )}
                        </ViewPager>
                        <Button onPress={selectImage} style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
                    </View>
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