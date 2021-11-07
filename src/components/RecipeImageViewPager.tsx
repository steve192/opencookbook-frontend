import { Avatar, Button, Icon, ViewPager, Text } from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import RestAPI, { RecipeImage } from '../dao/RestAPI';
import { RecipeImageComponent } from './RecipeImageComponent';

interface Props {
    onImageAdded?: (uuid: string) => void,
    images: RecipeImage[],
    allowEdit?: boolean,
    style: StyleProp<ViewStyle>
}

export const RecipeImageViewPager = (props: Props) => {


    const [shownImageIndex, setShownImageIndex] = useState<number>(0);

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
            props.onImageAdded ? props.onImageAdded(uuid) : null;
        }).catch((error) => {
            //TODO: Error handling
            alert("Error uploading picture");
        });
    };

    return (
        <View style={[styles.recipeImageContainer, props.style]}>
            <ViewPager
                selectedIndex={shownImageIndex}
                onSelect={setShownImageIndex}
                style={styles.recipeImage}>

                {props.images.length === 0 ?
                    <Avatar
                        source={require('../../assets/placeholder.png')}
                        style={styles.recipeImage} /> :

                    props.images.map((image, imageIndex) =>
                        <RecipeImageComponent
                            uuid={image.uuid}/>
                    )}
            </ViewPager>
            {!props.allowEdit ? null :
                <Button onPress={selectImage} style={styles.imageButton} status="basic" accessoryLeft={<Icon name="camera" />} />
            }

            <Text style={styles.indexIndicator}>{shownImageIndex + 1} / {props.images.length}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    indexIndicator: {
        fontWeight: "bold",
        position: "absolute",
        bottom: 10,
        left: 10,
        color: "white",
        backgroundColor: "rgba( 0,0,0,0.3)",
        borderRadius: 5,
        padding: 10
    },
    recipeImageContainer: {
        alignSelf: 'center',
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(161, 161, 161)"
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
    recipeImage: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
    },
});