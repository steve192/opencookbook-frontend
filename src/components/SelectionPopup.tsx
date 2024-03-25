import React, {useRef, useState} from 'react';
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

  const textbox = useRef<typeof TextInput>(null);


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
            // disabled={true}
            mode="outlined"
            onFocus={() => {
              // @ts-ignore Works on html elements (web), but probaply does not on android / ios
              textbox.current?.blur();
              // @ts-ignore see above
              textbox.current?.blur && openModal();
            } }
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


