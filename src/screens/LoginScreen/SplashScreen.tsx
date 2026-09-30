import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useAppTheme} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';

export const SplashScreen = () => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  return (
    <LoginBackdrop>
      <View style={styles.loginContainer}>
        <View style={styles.innerLoginContainer}>
          <Text style={styles.title}>CookPal</Text>
          <View style={styles.status}>
            <ActivityIndicator />
            <Text style={{color: theme.colors.onPrimary}}>{t('screens.splash.loggingin')}</Text>
          </View>
        </View>
      </View>
    </LoginBackdrop>
  );
};

const styles = StyleSheet.create({
  title: {
    paddingBottom: 20,
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  status: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerLoginContainer: {
    maxWidth: 500,
    width: '100%',
  },
  loginContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },
});
