import { Avatar } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Platform } from 'react-native';
import RestAPI from '../dao/RestAPI';

interface Props {
    uuid?: string | undefined
}
export const RecipeImageComponent = (props: Props) => {


    const [imageData, setImageData] = useState<string>();
    const [requestPending, setRequestPending] = useState<boolean>(false);


    // Hook for loading images used and putting them in the buffer
    useEffect(() => {
        if (!imageData && !requestPending && props.uuid) {
            setRequestPending(true);
            RestAPI.getImageAsDataURI(props.uuid).then((data) => {
                setImageData(data);
                setRequestPending(false);
            }).catch((error) => {
                alert("Error fetching image" + error);
                //TODO: Error handling
            });
        }
    });

    return (
        // <Avatar
        //     source={imageData ? { uri: imageData } : require('../../assets/placeholder.png')}
        //     style={styles.recipeImage} />
        <Image
            source={imageData ? { uri: imageData } : require('../../assets/placeholder.png')}
            style={styles.recipeImage} />
    )
}

const styles = StyleSheet.create({
    recipeImage: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
        resizeMode: Platform.OS === "web" ? 'center' : 'cover'
    },
});