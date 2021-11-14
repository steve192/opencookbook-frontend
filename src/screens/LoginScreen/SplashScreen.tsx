import { Spinner, Text } from '@ui-kitten/components';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Configuration from '../../Configuration';
import RestAPI from '../../dao/RestAPI';
import { login, logout } from '../../redux/features/authSlice';
import { LoginBackdrop } from './LoginBackdrop';



export const SplashScreen = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        // Load application data
        (async () => {
            try {
                const authToken = await Configuration.getAuthToken();
                if (!authToken) {
                    dispatch(logout());
                    return;
                }
                await RestAPI.renewToken(authToken);
                dispatch(login());
            } catch (e) {
                dispatch(logout());
            }
        })();
    }, []);

    return (
        <LoginBackdrop>
            <View style={styles.loginContainer}>
                <View style={styles.innerLoginContainer}>
                    <Text style={styles.title}>OpenCookbook</Text>
                    <View style={{
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Spinner />
                    </View>
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
