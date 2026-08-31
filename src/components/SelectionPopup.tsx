import React, {useRef, useState} from 'react';
import {Pressable, StyleProp, TextInput as RNTextInput, View, ViewStyle} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Option, SelectionPopupModal} from './SelectionPopupModal';


interface Props {
    value: string,
    label?: string,
    options: Option[],
    onValueChanged?: (newValue: Option) => void,
    placeholder?: string,
    allowAdditionalValues?: boolean,
    dense?: boolean,
    style?: StyleProp<ViewStyle>
}


export const SelectionPopup = (props: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Paper TextInput's ref typing intersects RNTextInput & TextInputHandles, which is
  // not satisfiable on its own - use the wider RNTextInput type Paper actually forwards to.
  const textbox = useRef<RNTextInput>(null);


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
            ref={textbox}
            label={props.label}
            dense={props.dense}
            mode="outlined"
            onFocus={() => {
              textbox.current?.blur();
              openModal();
            }}
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


