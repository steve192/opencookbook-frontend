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



type Props = NativeStackScreenProps<MainNavigationProps, 'SignupScreen'>;

export const SignupScreen = ({ route, navigation }: Props) => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [apiErrorMessage, setApiErrorMessage] = useState<string>();

    const register = () => {

        RestAPI.registerUser(email, password).then(() => {
            setApiErrorMessage(undefined);
            navigation.goBack();
        }).catch((error: Error) => {
            setApiErrorMessage(error.toString());
        });

    };

    const passwordsMatching = password === passwordConfirm;
    //TODO: Check if email is valid
    const allFieldsOk = passwordsMatching && password && email;


    return (
        <LoginBackdrop>
                <View style={styles.loginContainer}>
                    <View style={styles.innerLoginContainer}>
                        <Text style={styles.title}>Register</Text>
                        <Input value={email} onChangeText={text => setEmail(text)} placeholder="E-Mail"></Input>
                        <Spacer height={20} />
                        <Input status={passwordsMatching ? "basic" : "danger"} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={true} />
                        <Spacer height={10} />
                        <Input status={passwordsMatching ? "basic" : "danger"} value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder="Password Confirm" secureTextEntry={true} />
                        {!passwordsMatching ? <Text status="danger">Passwords do not match</Text> : null }
                        <Button disabled={allFieldsOk ? false: true} style={CentralStyles.elementSpacing} onPress={register}>Register</Button>
                        {apiErrorMessage ? <Text status="danger">{apiErrorMessage}</Text> : null}
                    </View>
                </View>
        </LoginBackdrop>
    )

}

const styles = StyleSheet.create({
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
