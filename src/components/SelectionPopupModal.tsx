import {HeaderHeightContext} from '@react-navigation/elements';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, View} from 'react-native';
import {ScrollView} from 'react-native';
import {Divider, List, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {modalStyles} from '../styles/CentralStyles';


export interface Option {
    key: string;
    value: string;
    newlyCreated?: boolean;
}

interface ListItemData {
  option: Option
}

interface Props {
    modalVisible: boolean;
    options: Option[];
    onClose: () => void;
    placeholder?: string;
    onSelection: (selectedValue: Option) => void;

}


export const SelectionPopupModal = (props: Props) => {
  const modalInputRef = useRef<typeof TextInput>(null);
  const [value, setValue] = useState<string>('');


  const {t} = useTranslation('translation');

  const onSearchInputChange = (newText: string) => {
    setValue(newText);
  };
  const sortFunction = (a:Option, b:Option): number => {
    if (a.value.toLocaleLowerCase() > b.value.toLocaleLowerCase()) {
      return 1;
    } else if (a.value == b.value) {
      return 0;
    } else {
      return -1;
    }
  };


  const getListItemData = (): ListItemData[] => {
    const filteredItems = value ?
            props.options.filter((option) => option.value.toLowerCase().startsWith(value.toLowerCase())) :
            props.options;

    filteredItems.sort(sortFunction);

    const listItems: ListItemData[] = value.length > 0 ? [{option: {key: '', value: t('common.createImperative') + ' ' + value, newlyCreated: true}}] : [];
    if (filteredItems.length > 0) {
      filteredItems.forEach((item) => {
        listItems.push({option: item});
      });
    }
    return listItems;
  };

  return <View style={modalStyles.centeredView}>
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onShow={() => modalInputRef.current?.focus()}
      onRequestClose={() => props.onClose()}
    >
      <Pressable
        onPress={() => props.onClose()}
        style={modalStyles.modalBackdrop}>
        <HeaderHeightContext.Consumer>
          {(headerHeight) => headerHeight &&
            <>
              <View style={modalStyles.centeredView}>
                {/* headerHeight / 2 is a workaround. Calculate the real header height (header height is navigation bar + safe area, instead of only navigation bar)*/}
                <Surface style={[{flex: 1, marginTop: (headerHeight / 2), width: '100%'}, modalStyles.modalView]}>
                  <View
                    style={{flexDirection: 'row', alignContent: 'center'}}>
                    <TextInput placeholder={props.placeholder} ref={modalInputRef} onChangeText={onSearchInputChange} style={{flex: 1}} value={value} />
                    <Spacer width={10} />
                  </View>
                  <Divider style={{paddingVertical: 2, marginVertical: 10}} />
                  <ScrollView keyboardShouldPersistTaps={'handled'}>
                    {getListItemData().map((data, index) => <List.Item
                      key={index}
                      title={data.option.value}
                      onPress={() => data.option.newlyCreated ? props.onSelection({key: '', value: value, newlyCreated: true}) : props.onSelection(data.option)} />,
                    )}
                  </ScrollView>
                </Surface>
              </View>
            </>}
        </HeaderHeightContext.Consumer>
      </Pressable>
    </Modal>
  </View>;
};


