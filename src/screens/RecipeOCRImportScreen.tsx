import {Image, TouchableOpacity, View} from 'react-native';
import {FAB, IconButton, ProgressBar, Surface, Text} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';
import React, {useEffect, useRef, useState} from 'react';
import {Camera, CameraCapturedPicture, CameraType, FlashMode, ImageType} from 'expo-camera';
import {ImageCropper} from '../components/ImageCropper';
import RestAPI from '../dao/RestAPI';

export const RecipeOCRImportScreen = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const camera = useRef<Camera>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [picture, setPicture] = useState<CameraCapturedPicture>();

  const [ocrProcessId, setOcrProcessId] = useState<string>();
  const [ocrStatus, setOcrStatus] = useState('');

  const [points, setPoints] = useState([
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
  ]);

  useEffect(() => {
    if (ocrProcessId === undefined) {
      return;
    }
    const checkStatus = async () => {
      try {
        const status = await RestAPI.getOCRStatus(ocrProcessId);
        setOcrStatus(status.status);
        if (status.result !== undefined) {
          const text = status.result.map((lineBox) => lineBox.content).join();
          setOcrStatus(text);
          return;
        }
      } catch (e) {
        if (e.response.status == 404) {
          return;
        }
        alert('Something went wrong' + JSON.stringify(e));
      }
      setTimeout(checkStatus, 1000);
    };

    setTimeout(checkStatus, 1000);
  }, [ocrProcessId]);

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
    return <>
      <ImageCropper
        source={picture}
        onPointsChange={(point1, point2, point3, point4) => {
          setPoints([
            {x: Math.floor(point1.x), y: Math.floor(point1.y)},
            {x: Math.floor(point2.x), y: Math.floor(point2.y)},
            {x: Math.floor(point3.x), y: Math.floor(point3.y)},
            {x: Math.floor(point4.x), y: Math.floor(point4.y)},
          ]);
        }} />
      <FAB
        icon="plus"
        style={{position: 'absolute'}}
        onPress={() => {
          const retry = async () => {
            try {
              const result = await RestAPI.ocrImage(picture!.uri, points);
              setOcrProcessId(result);
              setWizardStep(wizardStep +1 );
            } catch (e) {
              if (e.response?.status == 503) {
                setTimeout(retry, 5000);
              }
              alert('Somemthing went wrong' + JSON.stringify(e));
            }
          };
          retry();
        }}
      />
    </>;
  };

  const step3 = () => {
    return <>
      <Text>Status: {ocrStatus}</Text>
    </>;
  };

  return <Surface style={CentralStyles.fullscreen}>
    { wizardStep === 0 && step1()}
    { wizardStep === 1 && step2()}
    { wizardStep === 2 && step3()}
  </Surface>;
};
