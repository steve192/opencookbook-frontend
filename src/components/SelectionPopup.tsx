import React, {useState} from 'react';
import {Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Option, SelectionPopupModal} from './SelectionPopupModal';


interface Props {
    value: string,
    label?: string,
    options: Option[],
    onValueChanged?: (newValue: Option) => void,
    placeholder?: string,
    allowAdditionalValues?: boolean,
    style?: StyleProp<ViewStyle>
}


export const SelectionPopup = (props: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);


  const openModal = () => {
    setModalVisible(true);
  };


  const applySelection = (selectedValue: Option) => {
    props.onValueChanged?.(selectedValue);
    setModalVisible(false);
  };


  return (
    <>
      <Pressable
        style={props.style}
        onPress={() => openModal()}>
        <View pointerEvents="none">
          <TextInput
            label={props.label}
            disabled={true}
            mode="outlined"
            placeholder={props.placeholder}
            value={props.value}/>
        </View>
      </Pressable>

      {modalVisible && <SelectionPopupModal
        modalVisible={modalVisible}
        options={props.options}
        onClose={() => setModalVisible(false) }
        onSelection={applySelection}
        placeholder={props.placeholder}
      />
      }
    </>
  );
};


