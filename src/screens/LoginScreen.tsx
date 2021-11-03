import React, { useState } from 'react';
import { Button, Card, Icon, Input, Layout, Modal, Text } from '@ui-kitten/components';
import { ScrollView, View, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import RestAPI from '../dao/RestAPI';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import Configuration from '../Configuration';
import Spacer from 'react-spacer';
import { color } from 'react-native-reanimated';



type Props = NativeStackScreenProps<MainNavigationProps, 'LoginScreen'>;

const LoginScreen = ({ route, navigation }: Props) => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
    const [serverUrl, setServerUrl] = useState<string>(Configuration.getBackendURL());

    const onClick = () => {
        navigation.navigate('OverviewScreen');
        RestAPI.authenticate(email, password).then(() => {
        }).catch(() => {
        });

    };

    const settingsModal = (
        <Modal
            visible={settingsModalVisible}
            backdropStyle={styles.backdrop}
            onBackdropPress={() => setSettingsModalVisible(false)}>
            <Card disabled={true} style={styles.card}>
                <Text>Server URL</Text>
                <Input value={serverUrl} onChangeText={(text) => setServerUrl(text)} />
                <Button onPress={() => {
                    setSettingsModalVisible(false);
                    Configuration.setBackendURL(serverUrl);
                }}>
                    Save
                </Button>
            </Card>
        </Modal>
    )

    return (
        <ImageBackground
            style={styles.container}
            source={require("../assets/login-screen.jpg")}>
            <View style={{backgroundColor: "rgba(0, 0, 0, 0.45)", position: 'absolute', top: 0, left: 0, right:0, bottom: 0}}>
                <View
                    style={styles.container}>
                    <Button status="control" onPress={() => setSettingsModalVisible(true)} accessoryLeft={<Icon name="settings-outline" />} style={styles.settingsButton} />
                    <View style={styles.loginContainer}>
                        <View style={styles.card}>
                            <Text style={styles.title}>OpenCookbook</Text>
                            <Input value={email} onChangeText={text => setEmail(text)} placeholder="E-Mail"></Input>
                            <Spacer height={10} />
                            <Input value={password} onChangeText={text => setPassword(text)} placeholder="Password" secureTextEntry={true} ></Input>
                            <Button style={CentralStyles.elementSpacing} onPress={onClick}>Login</Button>
                        </View>
                    </View>
                    {settingsModal}
                </View>
            </View>
        </ImageBackground>
    )

}
StyleSheet.absoluteFill

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    settingsButton: {
        width: 16,
        height: 16,
        alignSelf: "flex-end",
        right: 0,
        top: 0,
        borderRadius: 24,
        marginBottom: 10
    },
    title: {
        paddingBottom: 20,
        fontWeight: "bold",
        fontSize: 30,
        textAlign: "center",
        color: "white"
    },
    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    card: {
        maxWidth: 500,
        width: "100%",
        // opacity: 0.8
    },
    loginContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoginScreen;