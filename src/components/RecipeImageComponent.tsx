import { Avatar, Spinner } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, View } from 'react-native';
import RestAPI from '../dao/RestAPI';

interface Props {
    uuid?: string | undefined
    forceFitScaling?: boolean
}
export const RecipeImageComponent = (props: Props) => {


    const [imageData, setImageData] = useState<string>();
    const [requestPending, setRequestPending] = useState<boolean>(false);


    // Hook for loading images used and putting them in the buffer
    useEffect(() => {
        if (!requestPending && props.uuid) {
            setRequestPending(true);
            RestAPI.getImageAsDataURI(props.uuid).then((data) => {
                setImageData(data);
                setRequestPending(false);
            }).catch((error) => {
                alert("Error fetching image" + error);
                //TODO: Error handling
            });
        }
    },[props.uuid]);

    const resizeMode = Platform.OS === "web" && !props.forceFitScaling ? 'center' : 'cover';

    return (
        <>
            <Image
                source={imageData ? { uri: imageData } : require('../../assets/placeholder.png')}
                style={[styles.recipeImage, {resizeMode: resizeMode}]} />
            {requestPending  &&
                <View style={styles.loadingSpinner}>
                    <Spinner size="giant" />
                </View>}
        </>
    )
}

const styles = StyleSheet.create({
    loadingSpinner: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        width: "100%",
        height: "100%"
    },
    recipeImage: {
        width: "100%",
        height: "100%",
        
    },
});