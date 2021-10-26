import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, Button, Icon, Input, Layout, StyleService } from '@ui-kitten/components';
import React, { useState } from 'react';
import { ImageProps, View } from 'react-native';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';

interface INewRecipe {
    title: string;
    preparationSteps: string[];
}


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;
const RecipeWizardScreen = (props: Props) => {

    let [currentStep, setCurrentStep] = useState(0);
    let [newRecipeData, setNewRecipeData] = useState<INewRecipe>({ title: "test", preparationSteps: ["test"] });

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
                        <View>
                            <View style={[styles.recipeImageContainer, CentralStyles.elementSpacing]}>
                                <Avatar
                                    source={require('../assets/placeholder.png')}
                                    style={styles.recipeImage} />
                                <Button style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
                            </View>
                            <Input
                                value={newRecipeData.title}
                                onChangeText={(newText) => setNewRecipeData({ ...newRecipeData, title: newText })}
                                placeholder="Name" />
                        </View>
                        <Button
                            size='giant'
                            onPress={() => setCurrentStep(currentStep + 1)}>Next</Button>
                    </View>
                )

            case 1:
                return (
                    <View style={styles.contentContainer}>
                        <ScrollView style={CentralStyles.scrollView}>
                            {newRecipeData.preparationSteps.map((preparationStep, preparationStepIndex) =>
                                <Input
                                    key={preparationStepIndex}
                                    multiline={true}
                                    value={newRecipeData.preparationSteps[preparationStepIndex]}
                                    onChangeText={newText => changeRecipeStep(newText, preparationStepIndex)}
                                    placeholder="Add description of preparation step..." />
                            )}
                            <Button accessoryLeft={AddIcon} onPress={addPreparationStep} />
                        </ScrollView>
                        <Button
                            size="giant"
                            onPress={() => createNewRecipe()}>Create</Button>
                    </View>
                )
        }
    };

    const createNewRecipe = () => {
        alert(JSON.stringify(newRecipeData));
    };

    return (
        <View style={styles.viewContainer}>
            {getWizardStep(currentStep)}
        </View>
    )



}

const styles = StyleSheet.create({
    recipeImageContainer: {
        alignSelf: 'center',
        width: 320,
        height: 320,
        borderRadius: 16,
    },
    recipeImage: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
    },
    imageButton: {
        position: "absolute",
        alignSelf: "flex-end",
        bottom: 0,
        right: 16,
        top: 32,
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    viewContainer: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16

        // flexDirection: 'row',
        // alignItems: 'center',
        // marginTop: 24,
    },
    contentContainer: {
        flex: 1,
        marginTop: 48,
        justifyContent: 'space-between'
    }
});







export default RecipeWizardScreen;