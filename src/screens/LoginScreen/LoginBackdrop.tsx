import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CentralStyles from '../../styles/CentralStyles';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';


export const LoginBackdrop = (props: {children:React.ReactNode}) => {
  return (
    <KeyboardAvoidingView
      style={CentralStyles.fullscreen}
    >
      <ImageBackground
        style={styles.container}
        source={require('../../../assets/login-screen.jpg')}>
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.45)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
          <>
            <SafeAreaInsetsContext.Consumer>
              {(insets) => insets && <View style={{paddingTop: insets.top}} />}
            </SafeAreaInsetsContext.Consumer>
            {props.children}
          </>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});
