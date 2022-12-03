import {HeaderHeightContext} from '@react-navigation/elements';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Divider, List, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {RecipeImage} from '../dao/RestAPI';
import {RecipeImageComponent} from './RecipeImageComponent';


interface Props {
    style?: StyleProp<ViewStyle>
    onClose: () => void
    images: RecipeImage[]
}


export const ImageEditorPopup = (props: Props) => {
  const {t} = useTranslation('translation');

  return (
    <>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={props.onClose}
        >
          <Pressable
            onPress={props.onClose}
            style={styles.modalBackdrop}>
            <HeaderHeightContext.Consumer>
              {(headerHeight) => headerHeight &&
                                    <>
                                      <View style={styles.centeredView}>
                                        {/* headerHeight / 2 is a workaround. Calculate the real header height (header height is navigation bar + safe area, instead of only navigation bar)*/}
                                        <Surface style={[{flex: 1, marginTop: (headerHeight / 2), width: '100%'}, styles.modalView]}>
                                          {props.images.map((image) =>
                                            <RecipeImageComponent
                                              style={styles.dndimage}
                                              key={image.uuid}
                                              uuid={image.uuid}
                                              useThumbnail={true}/>,
                                          )}
                                        </Surface>
                                      </View>
                                    </>
              }
            </HeaderHeightContext.Consumer>
          </Pressable>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  dndimage: {
    maxWidth: 200,
    maxHeight: 200,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%',
  },
  modalBackdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 600,
    maxHeight: 800,
    flex: 1,
    marginBottom: 10,
    padding: 10,
    marginHorizontal: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
