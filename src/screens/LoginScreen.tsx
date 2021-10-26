import React, { useState } from 'react';
import { Button, Card, Input, Layout, Text } from '@ui-kitten/components';
import { ScrollView, View, StyleSheet, ImageBackground } from 'react-native';
import RestAPI from '../dao/RestAPI';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainNavigationProps } from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';



type Props = NativeStackScreenProps<MainNavigationProps, 'LoginScreen'>;

const LoginScreen = ({ route, navigation }: Props) => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const onClick = () => {
        navigation.navigate('OverviewScreen');
        RestAPI.authenticate(email, password).then(() => {
        }).catch(() => {
        });

    };
    return (
        <ImageBackground
            style={styles.container}
            source={require("../assets/login-screen.jpg")}>
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>OpenCookbook</Text>
                    <Card style={styles.card}>
                        <Input value={email} onChangeText={text => setEmail(text)} placeholder="E-Mail"></Input>
                        <Input value={password} onChangeText={text => setPassword(text)} placeholder="Password" secureTextEntry={true} ></Input>
                        <Button style={CentralStyles.elementSpacing} onPress={onClick}>Login</Button>
                    </Card>
                </View>
        </ImageBackground>
    )

}


const styles = StyleSheet.create({
    title: {
        color: "white",
        padding: 20,
        fontWeight: "bold",
        fontSize: 30

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