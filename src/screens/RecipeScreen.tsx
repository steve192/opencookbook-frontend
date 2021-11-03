import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { MainNavigationProps } from "../navigation/NavigationRoutes";
import { Avatar, Button, Text, useTheme, ViewPager } from '@ui-kitten/components';
import { StatusBar } from "../components/StatusBar";
import CentralStyles from "../styles/CentralStyles";
import { ScrollView } from "react-native-gesture-handler";
import Spacer from "react-spacer";
import { MinusIcon, PlusIcon } from "../assets/Icons";


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
    props.navigation.setOptions({ title: props.route.params.recipe.title });
    
    const [portions, setPortions] = useState<number>(1);
    
    const theme = useTheme();

    const renderIngredientsSection = () => (
        <>
            <Text category="label">Ingredients</Text>
            <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                    {props.route.params.recipe.neededIngredients.map(ingredient =>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Text style={{ color: theme["color-primary-default"], fontWeight: "bold", marginRight: 20 }}>{ingredient.amount + ingredient.unit}</Text>
                            <Text >{ingredient.ingredient.name}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.portionsContainer}>
                    <Button
                        style={CentralStyles.iconButton}
                        size='tiny'
                        accessoryLeft={<MinusIcon />} />
                    <Text style={{ paddingHorizontal: 20 }}> {portions} Portions</Text>
                    <Button
                        style={CentralStyles.iconButton}
                        size='tiny'
                        accessoryLeft={<PlusIcon />} />
                </View>
            </View>
        </>
    )

    const renderStepsSection = () => (
        <>
            <Text category="label">Preparation steps</Text>
            {props.route.params.recipe.preparationSteps.map((preparationStep, index) => (
                <>
                    <View style={{ flex: 1, flexDirection: "row", paddingVertical: 10 }}>
                        <Text style={styles.textBullet}>{index + 1}</Text>
                        <Text style={{textAlignVertical: "center"}}>{preparationStep}</Text>
                    </View>
                </>
            ))}
        </>
    );


    return (
        <>
            <StatusBar />
            <ScrollView>
                <ViewPager
                    selectedIndex={0}
                    style={styles.recipeImage}>
                    <Avatar
                        key={0 + "image"}
                        source={require('../assets/placeholder.png')}
                        style={styles.recipeImage} />
                </ViewPager>
                <View style={styles.formContainer} >
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
    textBullet: {
        color: "green",
        borderColor: "green",
        borderWidth: 2,
        borderRadius: 32,
        width: 32,
        height: 32,
        textAlign: "center",
        textAlignVertical: "center",
        fontWeight: "bold",
        marginRight: 10
    },
    recipeImage: {
        width: "100%",
        height: 320,
        borderRadius: 0,
    },
    formContainer: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    portionsContainer: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row',
        flexGrow: 1,
    },
});

