import { Button, Card, Divider, Input, List, ListItem, Text } from '@ui-kitten/components';
import React, { useState } from 'react';
import { ListRenderItemInfo, Pressable, StyleSheet, View, Modal } from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from './StatusBar';
import { HeaderHeightContext } from '@react-navigation/elements';
import { PlusIcon } from '../assets/Icons';
import Spacer from 'react-spacer';



interface Props {
    value: string,
    options: string[],
    onValueChanged?: (newValue: string) => void,
    placeholder?: string
}

export const SelectionPopup = (props: Props) => {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");

    const openModal = () => {
        setModalVisible(true);
    }

    const renderListItem = (info: ListRenderItemInfo<string>) =>
        <ListItem
            title={info.item}
            onPress={() => {
                props.onValueChanged?.(info.item);
                setModalVisible(false);
            }}
        />

    const onSearchInputChange = (newText: string) => {
        setValue(newText);
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
                    onRequestClose={() => setModalVisible(false)}
                >
                    <HeaderHeightContext.Consumer>
                        {headerHeight =>
                            <>
                                <View style={styles.centeredView}>
                                        <Card style={[{ marginTop: headerHeight, width: "100%" }, styles.modalView]}>
                                        {/* <Text style={styles.modalText}>Hello World! long text</Text> */}
                                            <View style={{ flexDirection: "row", alignContent: "center" }}>
                                                <Input onChangeText={onSearchInputChange} style={{ flex: 1 }} value={value} />
                                                <Spacer width={10} />
                                                <Button size="tiny" accessoryLeft={PlusIcon} />
                                            </View>
                                            <List
                                                renderItem={renderListItem}
                                                ItemSeparatorComponent={Divider}
                                                data={props.options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))}
                                            />

                                        </Card>
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
        width: "100%",
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
        padding: 10
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});