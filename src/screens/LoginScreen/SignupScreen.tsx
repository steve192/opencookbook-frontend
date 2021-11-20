import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, CheckBox, Input, Text, useTheme } from '@ui-kitten/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';
import Spacer from 'react-spacer';
import RestAPI from '../../dao/RestAPI';
import { LoginNavigationProps } from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import { LoginBackdrop } from './LoginBackdrop';



type Props = NativeStackScreenProps<LoginNavigationProps, 'SignupScreen'>;

export const SignupScreen = ({ route, navigation }: Props) => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [apiErrorMessage, setApiErrorMessage] = useState<string>();
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    const theme = useTheme();

    const { t } = useTranslation("translation");


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
                    <Text style={styles.title}>{t("screens.login.register")}</Text>
                    <Input value={email} onChangeText={text => setEmail(text)} placeholder={t("screens.login.email")}></Input>
                    <Spacer height={20} />
                    <Input status={passwordsMatching ? "basic" : "danger"} value={password} onChangeText={setPassword} placeholder={t("screens.login.password")} secureTextEntry={true} />
                    <Spacer height={5} />
                    <Input status={passwordsMatching ? "basic" : "danger"} value={passwordConfirm} onChangeText={setPasswordConfirm} placeholder={t("screens.login.passwordConfirm")} secureTextEntry={true} />
                    {!passwordsMatching && <Text status="danger">{t("screens.login.errorNoPasswordMatch")}</Text> }
                    <Spacer height={20} />
                    <View style={{ flexDirection: "row" }}>
                        <CheckBox checked={termsAccepted} onChange={setTermsAccepted} />
                        <Text
                            onPress={() => setTermsAccepted(!termsAccepted)}
                            style={{ paddingLeft: 10, color: "white" }}>
                            {t("screens.login.acceptTOC")}{" "}
                            <Text
                                onPress={() => Linking.openURL("https://google.com")}
                                style={{ color: theme["color-primary-default"] }}>
                                {t("screens.login.toc")}
                            </Text>
                        </Text>
                    </View>
                    <Spacer height={20} />
                    <Button disabled={allFieldsOk ? false : true} style={CentralStyles.elementSpacing} onPress={register}>{t("screens.login.register")}</Button>
                    {apiErrorMessage && <Text status="danger">{apiErrorMessage}</Text>}
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
        marginLeft: 16,
        marginRight: 16
    },

});
