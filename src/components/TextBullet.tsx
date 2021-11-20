import { Text, useTheme } from '@ui-kitten/components';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';


interface Props {
    value: string
    style?: StyleProp<ViewStyle>
    selected?: boolean
    onPress?: () => void
}
export const TextBullet = (props: Props) => {
    const theme = useTheme();

    const additionalStylesContainer = props.selected ? 
        {backgroundColor: theme["color-primary-default"], borderColor: theme["color-primary-default"]} : 
        {borderColor: theme["color-primary-default"]};

    const additionalStylesText = props.selected ? {color: theme["text-alternate-color"]} : { color: theme["color-primary-default"]};

    return (
        <Pressable 
            style={[styles.textBulletContrainer, additionalStylesContainer, props.style]}
            onPress={props.onPress}>
            <Text style={[styles.textBullet, additionalStylesText]}>{props.value}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    textBulletContrainer: {
        borderWidth: 2,
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    textBullet: {
        fontWeight: "bold"
    },
});

