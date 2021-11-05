import React, { useState } from 'react';
import { Button, Card, Icon, Input, Layout, Modal, Text } from '@ui-kitten/components';
import { ScrollView, View, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import RestAPI from '../../dao/RestAPI';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainNavigationProps } from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import Configuration from '../../Configuration';
import Spacer from 'react-spacer';
import { color } from 'react-native-reanimated';
import { LoginBackdrop } from './LoginBackdrop';



type Props = NativeStackScreenProps<MainNavigationProps, 'LoginScreen'>;

const LoginScreen = ({ route, navigation }: Props) => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
    const [serverUrl, setServerUrl] = useState<string>(Configuration.getBackendURL());
    const [apiErrorMessage, setApiErrorMessage] = useState<string>();

    const doLogin = () => {

        RestAPI.authenticate(email, password).then(() => {
            navigation.navigate('OverviewScreen');
        }).catch((error: Error) => {
            setApiErrorMessage(error.toString());
        });

    };

    const settingsModal = (
        <Modal
            visible={settingsModalVisible}
            backdropStyle={styles.modalBackdrop}
            onBackdropPress={() => setSettingsModalVisible(false)}>
            <Card disabled={true} style={styles.innerLoginContainer}>
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
        <LoginBackdrop>
            <Button status="control" onPress={() => setSettingsModalVisible(true)} accessoryLeft={<Icon name="settings-outline" />} style={styles.settingsButton} />
            <View style={styles.loginContainer}>
                <View style={styles.innerLoginContainer}>
                    <Text style={styles.title}>OpenCookbook</Text>
                    <Input value={email} onChangeText={text => setEmail(text)} placeholder="E-Mail"></Input>
                    <Spacer height={10} />
                    <Input value={password} onChangeText={text => setPassword(text)} placeholder="Password" secureTextEntry={true} />
                    <View style={styles.forgotPasswordContainer}>
                        <Button
                            appearance='ghost'
                            status='basic'
                            onPress={() => null}>
                            Forgot your password?
                        </Button>
                    </View>
                    <Button style={CentralStyles.elementSpacing} onPress={doLogin}>Login</Button>
                    {apiErrorMessage ? <Text status="danger">{apiErrorMessage}</Text> : null}
                    <Button
                        appearance='ghost'
                        status='basic'
                        onPress={() => navigation.navigate("SignupScreen")}
                    >
                        Don't have an account? Create
                    </Button>
                </View>
            </View>
            {settingsModal}
        </LoginBackdrop>
    )

}

const styles = StyleSheet.create({
    modalBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
    innerLoginContainer: {
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