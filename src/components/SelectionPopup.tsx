import { HeaderHeightContext } from '@react-navigation/elements';
import { Divider, Input, Layout, List, ListItem, Text } from '@ui-kitten/components';
import React, { useRef, useState } from 'react';
import { ListRenderItemInfo, Modal, Pressable, StyleSheet, View } from 'react-native';
import Spacer from 'react-spacer';
import useAutoFocus from '../customHooks/useAutofocus';



interface Props {
    value: string,
    options: string[],
    onValueChanged?: (newValue: string) => void,
    placeholder?: string,
    allowAdditionalValues?: boolean
}

interface ListItemData {
    text: string
    isCreationItem: boolean
}

export const SelectionPopup = (props: Props) => {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");

    const modalInputRef = useRef<Input>(null);


    const openModal = () => {
        setModalVisible(true);
    }


    const renderListItem = (info: ListRenderItemInfo<ListItemData>) =>
        <ListItem
            title={
                <Text
                    style={{ fontWeight: info.item.isCreationItem ? "bold" : "normal" }}>
                    {info.item.text}
                </Text>}
            onPress={() => info.item.isCreationItem ? applySelection(value) : applySelection(info.item.text)}
        />

    const onSearchInputChange = (newText: string) => {
        setValue(newText);
    }

    const applySelection = (selectedValue: string) => {
        props.onValueChanged?.(selectedValue);
        setModalVisible(false);
    }

    const getListItemData = (): ListItemData[] => {
        const filteredItems = value ?
            props.options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
            : props.options;

        if (filteredItems.length > 0) {
            let listItems: ListItemData[] = [];
            filteredItems.forEach(item => {
                listItems.push({ text: item, isCreationItem: false });
            });
            return listItems;
        }

        return [{ text: "Create " + value, isCreationItem: true }];
    }


    return (
        <>
            <Pressable onPress={() => openModal()}>
                <View pointerEvents="none">
                    <Input
                        placeholder={props.placeholder}
                        value={props.value}></Input>
                </View>
            </Pressable>

            {/* <SafeAreaInsetsContext.Consumer>
                {insets => insets && */}
            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onShow={() => modalInputRef.current?.focus()}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <HeaderHeightContext.Consumer>
                        {headerHeight => headerHeight &&
                            <>
                                <View style={styles.centeredView}>
                                    {/*headerHeight / 2 is a workaround. Calculate the real header height (header height is navigation bar + safe area, instead of only navigation bar)*/}
                                    <Layout style={[{ flex: 1, marginTop: (headerHeight / 2), width: "100%" }, styles.modalView]}>
                                        <View
                                            style={{ flexDirection: "row", alignContent: "center" }}>
                                            <Input ref={modalInputRef} onChangeText={onSearchInputChange} style={{ flex: 1 }} value={value} />
                                            <Spacer width={10} />
                                        </View>
                                        <Divider style={{ paddingVertical: 2, marginVertical: 10 }} />
                                        <List
                                            style={{ flex: 1 }}
                                            renderItem={renderListItem}
                                            ItemSeparatorComponent={Divider}
                                            data={getListItemData()}
                                        />
                                    </Layout>
                                </View>
                            </>
                        }
                    </HeaderHeightContext.Consumer>
                </Modal>
            </View>
            {/* } */}
            {/* </SafeAreaInsetsContext.Consumer> */}
        </>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        width: "100%"
    },
    modalView: {
        width: "90%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: 600,
        maxHeight: 800,
        flex: 1,
        marginBottom: 10,
        padding: 10,
        marginHorizontal: 10
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});