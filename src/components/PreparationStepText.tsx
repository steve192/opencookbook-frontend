import { Text, useTheme } from '@ui-kitten/components';
import React from 'react';
import { StyleProp, TextStyle, StyleSheet, View } from 'react-native';
import { IngredientUse } from '../dao/RestAPI';

interface Props {
    value: string;
    style: StyleProp<TextStyle>;
    ingredients: IngredientUse[];
}
export const PreparationStepText = (props: Props) => {

    const theme = useTheme();

    const ingredientStyle: TextStyle = {
        color: theme["color-primary-default"],
        fontWeight: "bold"
    }

    const isIngredient = (word: string) => {
        const foundIngredient = props.ingredients.find(ingredient => ingredient.ingredient.name.toLowerCase() === word.toLowerCase());
        return foundIngredient !== undefined;
    }


    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {props.value.split(" ").map(word =>
                isIngredient(word) ?
                    <Text style={[props.style, ingredientStyle]}>{word} </Text>
                    :
                    <Text style={props.style}>{word} </Text>
            )
            }
        </View>
    );
}
