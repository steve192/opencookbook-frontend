import {HeaderHeightContext} from '@react-navigation/elements';
import {Divider, Input, Layout, List, ListItem, Text} from '@ui-kitten/components';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ListRenderItemInfo, Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Spacer from 'react-spacer';


export interface Option {
    key: string;
    value: string;
    newlyCreated?: boolean;
}
interface Props {
    value: string,
    options: Option[],
    onValueChanged?: (newValue: Option) => void,
    placeholder?: string,
    allowAdditionalValues?: boolean,
    style?: StyleProp<ViewStyle>
}

interface ListItemData {
    option: Option
}

export const SelectionPopup = (props: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  const modalInputRef = useRef<Input>(null);

  const {t} = useTranslation('translation');


  const openModal = () => {
    setModalVisible(true);
  };


  const renderListItem = (info: ListRenderItemInfo<ListItemData>) =>
    <ListItem
      key={info.index}
      title={
        <Text
          style={{fontWeight: info.item.option.newlyCreated ? 'bold' : 'normal'}}>
          {info.item.option.value}
        </Text>}
      onPress={() => info.item.option.newlyCreated ? applySelection({key: '', value: value, newlyCreated: true}) : applySelection(info.item.option)}
    />;

  const onSearchInputChange = (newText: string) => {
    setValue(newText);
  };

  const applySelection = (selectedValue: Option) => {
    props.onValueChanged?.(selectedValue);
    setModalVisible(false);
  };

  const getListItemData = (): ListItemData[] => {
    const filteredItems = value ?
            props.options.filter((option) => option.value.toLowerCase().startsWith(value.toLowerCase())) :
            props.options;

    if (filteredItems.length > 0) {
      const listItems: ListItemData[] = [];
      filteredItems.forEach((item) => {
        listItems.push({option: item});
      });
      return listItems;
    }

    return [{option: {key: '', value: t('common.createImperative') + ' ' + value, newlyCreated: true}}];
  };


  return (
    <>
      <Pressable
        style={props.style}
        onPress={() => openModal()}>
        <View pointerEvents="none">
          <Input
            placeholder={props.placeholder}
            value={props.value}></Input>
        </View>
      </Pressable>

      {modalVisible &&
                <View style={styles.centeredView}>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onShow={() => modalInputRef.current?.focus()}
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <Pressable
                      onPress={() => setModalVisible(false)}
                      style={styles.modalBackdrop}>
                      <HeaderHeightContext.Consumer>
                        {(headerHeight) => headerHeight &&
                                    <>
                                      <View style={styles.centeredView}>
                                        {/* headerHeight / 2 is a workaround. Calculate the real header height (header height is navigation bar + safe area, instead of only navigation bar)*/}
                                        <Layout style={[{flex: 1, marginTop: (headerHeight / 2), width: '100%'}, styles.modalView]}>
                                          <View
                                            style={{flexDirection: 'row', alignContent: 'center'}}>
                                            <Input placeholder={props.placeholder} ref={modalInputRef} onChangeText={onSearchInputChange} style={{flex: 1}} value={value} />
                                            <Spacer width={10} />
                                          </View>
                                          <Divider style={{paddingVertical: 2, marginVertical: 10}} />
                                          <List
                                            keyboardShouldPersistTaps='handled'
                                            style={{flex: 1}}
                                            renderItem={renderListItem}
                                            ItemSeparatorComponent={Divider}
                                            data={getListItemData()}
                                          />
                                        </Layout>
                                      </View>
                                    </>
                        }
                      </HeaderHeightContext.Consumer>
                    </Pressable>
                  </Modal>
                </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
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
