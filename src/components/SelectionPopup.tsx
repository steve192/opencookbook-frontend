import React, {useState} from 'react';
import {Keyboard, Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Option, SelectionPopupModal} from './SelectionPopupModal';


interface Props {
    value: string,
    label?: string,
    options: Option[],
    onValueChanged?: (newValue: Option) => void,
    placeholder?: string,
    allowCreate?: boolean,
    dense?: boolean,
    style?: StyleProp<ViewStyle>
}


export const SelectionPopup = (props: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);


  const openModal = () => {
    setModalVisible(true);
  };

  // Android hands the focus of a removed field to the field at the top of the screen, so the
  // search field gives it up before the modal unmounts.
  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };


  const applySelection = (selectedValue: Option) => {
    props.onValueChanged?.(selectedValue);
    closeModal();
  };


  return (
    <>
      <Pressable
        style={props.style}
        onPress={() => openModal()}>
        <View pointerEvents="none">
          {/* Display only: a field that can take focus gets it from Android without a tap */}
          <TextInput
            label={props.label}
            dense={props.dense}
            mode="outlined"
            editable={false}
            placeholder={props.placeholder}
            value={props.value}/>
        </View>
      </Pressable>

      {modalVisible && <SelectionPopupModal
        modalVisible={modalVisible}
        options={props.options}
        onClose={closeModal}
        onSelection={applySelection}
        placeholder={props.placeholder}
        allowCreate={props.allowCreate}
      />
      }
    </>
  );
};


