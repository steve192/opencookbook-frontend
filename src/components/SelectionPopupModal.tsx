import {HeaderHeightContext} from '@react-navigation/elements';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, View} from 'react-native';
import {Divider, List, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {modalStyles} from '../styles/CentralStyles';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';


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

    let listItems: ListItemData[] = value.length > 0 ? [{option: {key: '', value: t('common.createImperative') + ' ' + value, newlyCreated: true}}] : [];
    if (filteredItems.length > 0) {
      filteredItems.forEach((item) => {
        listItems.push({option: item});
      });
    }

    // Filter distinct values (user cannot distinct keys anyhow)
    const presentKeys: string[] = [];
    listItems = listItems.filter((item) => {
      if (presentKeys.indexOf(item.option.value) !== -1) {
        return false;
      }
      presentKeys.push(item.option.value);
      return true;
    });

    // Dont show empty values
    return listItems.filter((item) => item.option.value !== '');
  };

  const dataProvider = new DataProvider((r1, r2) => {
    return r1.key !== r2.key;
  }).cloneWithRows(getListItemData());

  const renderRow = (type: string|number, data: ListItemData) => <List.Item
    style={{width: 1000}} // Just enough to fill parent, value does not matter as its cut
    title={data.option.value}
    onPress={() => data.option.newlyCreated ? props.onSelection({key: '', value: value, newlyCreated: true}) : props.onSelection(data.option)} />;

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
              <View style={modalStyles.centeredView}>
                {/* headerHeight / 2 is a workaround. Calculate the real header height (header height is navigation bar + safe area, instead of only navigation bar)*/}
                <Surface style={[{flex: 1, marginTop: (headerHeight / 2), width: '100%'}, modalStyles.modalView]}>
                  <View
                    style={{flexDirection: 'row', alignContent: 'center'}}>
                    <TextInput
                      placeholder={props.placeholder}
                      ref={modalInputRef}
                      onChangeText={onSearchInputChange}
                      style={{flex: 1}}
                      value={value} />
                    <Spacer width={10} />
                  </View>
                  <Divider style={{paddingVertical: 2, marginVertical: 10}} />
                  {dataProvider.getSize() > 0 && <RecyclerListView
                    keyboardShouldPersistTaps={true}
                    rowRenderer={renderRow}
                    dataProvider={dataProvider}
                    forceNonDeterministicRendering={true}
                    layoutProvider={new LayoutProvider(
                        (index) => {
                          return 0; // Does not matter as only single type is used
                        },
                        (type, dim, index) => {
                          dim.width = 1000; // Just enough to fill parent, value does not matter
                          dim.height = 40; // Does not matter because of nonDeterministicRendering?
                        },
                    )}
                  >
                  </RecyclerListView>}
                </Surface>
              </View>
          }
        </HeaderHeightContext.Consumer>
      </Pressable>
    </Modal>
  </View>;
};


