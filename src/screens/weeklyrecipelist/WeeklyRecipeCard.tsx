import { Text } from '@ui-kitten/components';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CustomCard } from '../../components/CustomCard';
import { RecipeImageComponent } from '../../components/RecipeImageComponent';
import CentralStyles from '../../styles/CentralStyles';


interface Props {
    title: string;
    imageUuid: string;
    onPress: () => void;
}
export const WeeklyRecipeCard = (props: Props) => {
    return (
        <CustomCard
            style={[styles.card]}>
            <Pressable
                style={CentralStyles.fullscreen}
                onPress={props.onPress}
            >
                <View style={{ flex: 1 }}>
                    <Text style={{ marginBottom: 10 }}>{props.title}</Text>
                    <View style={{ flexGrow: 1 }}>
                        <RecipeImageComponent
                            forceFitScaling={true}
                            uuid={props.imageUuid} />
                    </View>
                </View>
            </Pressable>
        </CustomCard>

    )
}

const styles = StyleSheet.create({
    card: {
        height: 180,
        width: 200,
        margin: 5,
        padding: 5

    }
});