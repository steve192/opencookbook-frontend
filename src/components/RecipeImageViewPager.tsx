import { Avatar, Icon, ViewPager, Button } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import RestAPI, { RecipeImage } from '../dao/RestAPI';

interface Props {
    onImageAdded: (uuid: string) => void,
    images: RecipeImage[]
}

export const RecipeImageViewPager = (props: Props) => {

    
    const [shownImageIndex, setShownImageIndex] = useState<number>(0);
    const [imageDataBuffer, setImageDataBuffer] = useState<{ [uuid: string]: string }>({});


    // Hook for loading images used in the receipe and putting them in the buffer
    useEffect(() => {
        props.images.forEach((image) => {
            if (!imageDataBuffer[image.uuid]) {
                RestAPI.getImageAsDataURI(image.uuid).then((data) => {
                    setImageDataBuffer({ ...imageDataBuffer, [image.uuid]: data });
                }).catch((error) => {
                    alert("Error fetching image" + error);
                    //TODO: Error handling
                });
            }
        });
    });

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
            props.onImageAdded(uuid);
        }).catch((error) => {
            //TODO: Error handling
            alert("Error uploading picture");
        });
    };

    return (
        <View style={[styles.recipeImageContainer]}>
        <ViewPager
            selectedIndex={shownImageIndex}
            onSelect={setShownImageIndex}
            style={styles.recipeImage}>

            {props.images.length === 0 ?
                <Avatar
                    source={require('../../assets/placeholder.png')}
                    style={styles.recipeImage} /> :

                props.images.map((image, imageIndex) =>
                    <Avatar
                        key={imageIndex + "image"}
                        source={imageDataBuffer[image.uuid] ? { uri: imageDataBuffer[image.uuid] } : require('../../assets/placeholder.png')}
                        style={styles.recipeImage} />
                )}
        </ViewPager>
        <Button onPress={selectImage} style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
    </View>
    );
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
    }
});