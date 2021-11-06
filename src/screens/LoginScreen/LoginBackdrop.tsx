import React, { FunctionComponent } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';



export const LoginBackdrop: FunctionComponent = (props) => {

    return (
        <ImageBackground
            style={styles.container}
            source={require("../../assets/login-screen.jpg")}>
            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <>
                    <SafeAreaInsetsContext.Consumer>
                        {insets => insets ? <View style={{ paddingTop: insets.top }} /> : null}
                    </SafeAreaInsetsContext.Consumer>
                    {props.children}
                </>
            </View>
        </ImageBackground>
    )

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
    }
});
