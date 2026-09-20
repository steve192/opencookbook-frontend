import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Divider, List, Modal, Portal, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {overlayStyles, useAppTheme} from '../styles/CentralStyles';
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
    /** Offers what was typed as a new option; off where only existing options make sense. */
    allowCreate?: boolean;
    onSelection: (selectedValue: Option) => void;
}


export const SelectionPopupModal = (props: Props) => {
  const [value, setValue] = useState<string>('');
  const theme = useAppTheme();


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

    const offersCreate = (props.allowCreate ?? true) && value.length > 0;
    let listItems: ListItemData[] = offersCreate ?
      [{option: {key: '', value: t('common.createImperative') + ' ' + value, newlyCreated: true}}] : [];
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

  return (
    <Portal>
      <Modal
        visible={props.modalVisible}
        onDismiss={props.onClose}
        contentContainerStyle={[overlayStyles.modalView, {backgroundColor: theme.colors.elevation.level3}]}>
        <View style={{flexDirection: 'row', alignContent: 'center'}}>
          <TextInput
            autoFocus={true}
            placeholder={props.placeholder}
            onChangeText={onSearchInputChange}
            style={{flex: 1}}
            value={value} />
          <Spacer width={10} />
        </View>
        <Divider style={{paddingVertical: 2, marginVertical: 10}} />
        {dataProvider.getSize() > 0 && <RecyclerListView
          style={{flex: 1}}
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
      </Modal>
    </Portal>
  );
};


