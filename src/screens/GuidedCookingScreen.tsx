import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Layout, ViewPager, Text, Button, Divider } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Spacer from 'react-spacer';
import { TextBullet } from '../components/TextBullet';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import { useKeepAwake } from 'expo-keep-awake';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<MainNavigationProps, 'GuidedCookingScreen'>;
export const GuidedCookingScreen = (props: Props) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [textSize, setTextSize] = useState<number>(15);

    const { t } = useTranslation("translation");

    const recipe = props.route.params.recipe;
    useKeepAwake();

    return (
        <Layout >
            <View style={CentralStyles.contentContainer}>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                    {recipe.preparationSteps.map((step, index) =>
                        <>
                            <TextBullet
                                selected={index <= currentStep}
                                value={(index + 1).toString()} />
                            {index < currentStep && <View style={styles.stepConnector}></View>}
                        </>
                    )}
                </View>
            </View>
            <Spacer height={20} />
            <Divider />
            <Spacer height={20} />
            <ScrollView>
                <ViewPager
                    selectedIndex={currentStep}
                    onSelect={setCurrentStep}>
                    {recipe.preparationSteps.map((step, index) =>
                        <View style={CentralStyles.contentContainer}>
                            <Text style={[styles.preparationStep, { fontSize: textSize }]}>{step}</Text>
                            <Spacer height={20} />
                            <Divider />
                            <Spacer height={20} />
                            <Text category="label">{t("screens.guidedCooking.ingredients")}</Text>
                            {recipe.neededIngredients
                                .filter(neededIngredient => step.toLowerCase().includes(neededIngredient.ingredient.name.toLowerCase()))
                                .map((neededIngredient) => (
                                    <Text>{neededIngredient.ingredient.name}</Text>
                                ))}
                        </View>
                    )}

                </ViewPager>
                <Spacer height={20} />
                <Divider />
                <View style={CentralStyles.contentContainer}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Button
                            disabled={currentStep === 0}
                            onPress={() => setCurrentStep(currentStep - 1)}>
                            {t("common.previous")}
                        </Button>
                        <Button
                            disabled={currentStep === recipe.preparationSteps.length - 1}
                            onPress={() => setCurrentStep(currentStep + 1)}>
                            {t("common.next")}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    stepConnector: {
        backgroundColor: "green",
        height: 2,
        flexGrow: 1,
        alignSelf: "center",
        marginHorizontal: 10

    },
    preparationStep: {
    }
});