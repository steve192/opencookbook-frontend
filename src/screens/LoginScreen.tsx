import React, { useState } from 'react';
import { Button, Card, Icon, Input, Layout, Modal, Text } from '@ui-kitten/components';
import { ScrollView, View, StyleSheet, ImageBackground } from 'react-native';
import RestAPI from '../dao/RestAPI';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import Configuration from '../Configuration';
import { Spacer } from '../components/Spacer';



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
            <View style={styles.loginContainer}>
                <Card style={styles.card}>
                    <Button onPress={() => setSettingsModalVisible(true)} status='basic' accessoryLeft={<Icon name="settings-outline" />} style={styles.settingsButton} />
                    <Text style={styles.title}>OpenCookbook</Text>
                    <Input value={email} onChangeText={text => setEmail(text)} placeholder="E-Mail"></Input>
                    <Spacer/>
                    <Input value={password} onChangeText={text => setPassword(text)} placeholder="Password" secureTextEntry={true} ></Input>
                    <Button style={CentralStyles.elementSpacing} onPress={onClick}>Login</Button>
                </Card>
            </View>
            {settingsModal}
        </ImageBackground>
    )

}


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
        textAlign: "center"

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
        alignItems: 'center'
    },
});

export default LoginScreen;