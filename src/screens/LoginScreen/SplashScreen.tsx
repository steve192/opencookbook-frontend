import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import AppPersistence from '../../AppPersistence';
import RestAPI from '../../dao/RestAPI';
import {login, logout} from '../../redux/features/authSlice';
import {changeBackendUrl, changeOcrImportEnabled, changeOnlineState, changeSharingEnabled} from '../../redux/features/settingsSlice';
import {useAppDispatch} from '../../redux/hooks';
import {useAppTheme} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import NetInfo from '@react-native-community/netinfo';

export const SplashScreen = () => {
  const [statusText, setStatusText] = useState('');
  const dispatch = useAppDispatch();
  const theme= useAppTheme();

  const {t} = useTranslation('translation');


  useEffect(() => {
    (async () => {
      const state = await NetInfo.fetch();

      if (Platform.OS === 'android') {
        dispatch(changeOnlineState(state.isInternetReachable === true));
      } else {
        dispatch(changeOnlineState(state.isConnected === true));
      }


      console.log('Setting backend url');
      // TODO: Proper management of backend url via redux
      dispatch(changeBackendUrl(await AppPersistence.getBackendURL()));

      // What this instance offers, which is public and needed before anybody signs in - a
      // share link is opened by people who never will.
      RestAPI.getInstanceInfo()
          .then((instanceInfo) => {
            dispatch(changeSharingEnabled(instanceInfo.sharingEnabled));
            dispatch(changeOcrImportEnabled(instanceInfo.ocrImportEnabled));
          })
          .catch(() => console.info('Instance info unavailable, assuming defaults'));

      setStatusText(t('screens.splash.loggingin'));
      console.log('Getting userinfo');
      RestAPI.getUserInfo().then((userinfo) => {
        if (userinfo.email) {
          console.info('got userinfo, logging in');
          dispatch(login());
        } else {
          console.error('invalid userinfo', userinfo);
          dispatch(logout());
        }
      }).catch((error) => {
        console.error('Login failed', error);
        dispatch(logout());
      });
    })();
  }, []);

  return (
    <LoginBackdrop>
      <View style={styles.loginContainer}>
        <View style={styles.innerLoginContainer}>
          <Text style={styles.title}>CookPal</Text>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator />
            <Text style={{color: theme.colors.onPrimary}}>{statusText}</Text>
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
  innerLoginContainer: {
    maxWidth: 500,
    width: '100%',
    // opacity: 0.8
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
