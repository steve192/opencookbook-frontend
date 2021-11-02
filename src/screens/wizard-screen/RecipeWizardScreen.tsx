import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Autocomplete, AutocompleteItem, Avatar, Button, Icon, Input, Text, ViewPager } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { ImageProps, ScrollView, StyleSheet, View } from 'react-native';
import { Spacer } from '../../components/Spacer';
import RestAPI, { Ingredient, Recipe } from '../../dao/RestAPI';
import { MainNavigationProps } from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import { RecipeFormField } from './RecipeFormField';




type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;
const RecipeWizardScreen = (props: Props) => {

    let [currentStep, setCurrentStep] = useState(0);
    let [newRecipeData, setNewRecipeData] = useState<Recipe>({ title: "", neededIngredients: [{ ingredient: { id: 0, name: "" }, amount: 0, unit: "" }], preparationSteps: [""] });
    let [ingredientsQuery, setIngredientsQuery] = useState<string>("");
    let [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);



    const queryIngredients = () => {
        RestAPI.getIngredients(ingredientsQuery)
            .then((ingredients) => {
                setAvailableIngredients(
                    ingredients.filter(item => item.name.toLowerCase().includes(ingredientsQuery.toLowerCase()))
                );
    });
}


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

const removePreparationStep = (index: number) => {
    let preparationStepsCopy = newRecipeData.preparationSteps;
    preparationStepsCopy.splice(index, 1);
    setNewRecipeData({ ...newRecipeData, preparationSteps: preparationStepsCopy })
}

const renderIngredientOptions = (item: Ingredient, index: number) => (
    <AutocompleteItem
        key={index}
        title={item.name}
    />
);



const getWizardStep = (index: number) => {
    return (
        <View style={styles.contentContainer}>
            <ScrollView>
                <View style={[styles.recipeImageContainer]}>
                    <ViewPager
                        selectedIndex={0}
                        style={styles.recipeImage}>
                        <Avatar
                            key={0 + "image"}
                            source={require('../../assets/placeholder.png')}
                            style={styles.recipeImage} />
                    </ViewPager>
                    <Button style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
                </View>
                <View style={[styles.formContainer, CentralStyles.elementSpacing]}>
                    <Text category="label">Title</Text>
                    <Input
                        value={newRecipeData.title}
                        onChangeText={(newText) => setNewRecipeData({ ...newRecipeData, title: newText })}
                        placeholder="Name" />
                    <Spacer />
                    <Spacer />
                    <Text category="label">Ingredients</Text>
                    {newRecipeData.neededIngredients.map((neededIngredient, ingredientIndex) =>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Input
                                key={ingredientIndex + "amountUnit"}
                                value={neededIngredient.amount.toString() + " " + neededIngredient.unit}
                                placeholder="Amount and Unit" />
                            <Autocomplete
                                placeholder='Ingredient'
                                key={ingredientIndex + "name"}
                                value={ingredientsQuery}
                                // accessoryRight={renderCloseIcon}
                                onChangeText={(text) => setIngredientsQuery(text)}
                                onSelect={(index) => setIngredientsQuery(availableIngredients[index].name)}>
                                {availableIngredients.map((ingredient, index) => renderIngredientOptions(ingredient, index))}
                            </Autocomplete>

                            {ingredientIndex === newRecipeData.neededIngredients.length - 1 ? <Button size="small" key="addIngredient" accessoryLeft={AddIcon} onPress={addPreparationStep} /> : null}
                        </View>
                    )}
                    <Spacer />
                    <Spacer />
                    <Text category="label">Preparation Steps</Text>
                    {newRecipeData.preparationSteps.map((preparationStep, preparationStepIndex) =>
                        <>
                            <RecipeFormField
                                onRemovePress={() => removePreparationStep(preparationStepIndex)}
                                key={preparationStepIndex + "prepstep"}
                                multiline={true}
                                value={newRecipeData.preparationSteps[preparationStepIndex]}
                                onChangeText={newText => changeRecipeStep(newText, preparationStepIndex)}
                                placeholder="Add description of preparation step..." />

                            {preparationStepIndex === newRecipeData.preparationSteps.length - 1 ? <Button size="small" key="addStep" accessoryLeft={AddIcon} onPress={addPreparationStep} /> : null}
                        </>
                    )}
                </View>
            </ScrollView>
            <Button
                size="giant"
                onPress={() => createNewRecipe()}>Create</Button>
        </View>
    )

};

const createNewRecipe = () => {
    RestAPI.createNewRecipe(newRecipeData);
    alert(JSON.stringify(newRecipeData));
};

useEffect(queryIngredients, [ingredientsQuery]);

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