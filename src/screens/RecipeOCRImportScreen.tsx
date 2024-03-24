import {Image, TouchableOpacity, View} from 'react-native';
import {IconButton, Surface} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';
import React, {useRef, useState} from 'react';
import {Camera, CameraCapturedPicture, CameraType, FlashMode, ImageType} from 'expo-camera';
import {ImageCropper} from '../components/ImageCropper';

export const RecipeOCRImportScreen = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const camera = useRef<Camera>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [picture, setPicture] = useState<CameraCapturedPicture>();

  if (permission?.granted === false) {
    requestPermission();
  }

  const showPermissionError = permission?.granted === false && permission?.canAskAgain === false;

  const takePicture = () => {
    camera.current?.takePictureAsync({
      fastMode: false,
      quality: 1,
      exif: false,
      base64: false,
      imageType: ImageType.jpg,
      onPictureSaved: ((picture) => {
        setPicture(picture);
        setWizardStep(wizardStep + 1);
      }),
    });
  };

  const step1 = () => <Camera style={CentralStyles.fullscreen} type={CameraType.back}
    ref={camera}
    autoFocus={true}
    flashMode={FlashMode.auto}
    // focusDepth={}
    // pictureSize=''
    useCamera2Api={true}
  >
    <View style={[CentralStyles.fullscreen, {}]}>
      <TouchableOpacity
        onPress={takePicture}
        style={{position: 'absolute', backgroundColor: 'white', width: 90, height: 90, borderRadius: 50, bottom: 10, alignSelf: 'center', alignContent: 'center', display: 'flex', flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={takePicture}
          style={{position: 'absolute', backgroundColor: 'grey', width: 30, height: 30, borderRadius: 30, alignSelf: 'center', alignItems: 'center'}}/>
      </TouchableOpacity>
    </View>
  </Camera>;


  const step2 = () => {
    return <ImageCropper source={picture} />;
  }
  ;

  return <Surface style={CentralStyles.fullscreen}>
    { wizardStep === 0 && step1()}
    { wizardStep === 1 && step2()}
  </Surface>;
};
