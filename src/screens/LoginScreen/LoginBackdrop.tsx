import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {KeyboardAvoidingScreen} from '../../components/KeyboardAvoidingScreen';
import CentralStyles from '../../styles/CentralStyles';


export const LoginBackdrop = (props: {children:React.ReactNode}) => {
  return (
    <KeyboardAvoidingScreen>
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
    </KeyboardAvoidingScreen>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  notice: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
});

// The column the login flow's forms sit in: centered, as wide as a form needs to be.
export const LoginColumn = (props: {children: React.ReactNode}) => (
  <View style={styles.column}>
    <View style={CentralStyles.smallContentContainer}>{props.children}</View>
  </View>
);

// What stands in for a form that cannot work on this server: a message and the way out of it.
export const LoginNotice = (props: {testID: string, message: string, actionLabel: string, onAction: () => void}) => (
  <>
    <Text testID={props.testID} selectable style={styles.notice}>{props.message}</Text>
    <Button mode='contained' onPress={props.onAction}>{props.actionLabel}</Button>
  </>
);
