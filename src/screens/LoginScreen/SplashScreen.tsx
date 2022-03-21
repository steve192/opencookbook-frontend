import {Spinner, Text, useTheme} from '@ui-kitten/components';
import * as Updates from 'expo-updates';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import Configuration from '../../Configuration';
import RestAPI from '../../dao/RestAPI';
import {login, logout} from '../../redux/features/authSlice';
import {changeBackendUrl} from '../../redux/features/settingsSlice';
import {LoginBackdrop} from './LoginBackdrop';


export const SplashScreen = () => {
  const [statusText, setStatusText] = useState('');
  const dispatch = useDispatch();
  const theme= useTheme();

  useEffect(() => {
    (async () => {
      // Check for new app versions
      try {
        setStatusText('Checking for updates...');
        console.log('Update check');
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('Dowload update');
          setStatusText('Downloading new app version...');
          await Updates.fetchUpdateAsync();
          Updates.reloadAsync();
        }
      } catch (e) {
        // Ignore error, just start with unupdated version
      }

      // TODO: Proper management of backend url via redux
      dispatch(changeBackendUrl(await Configuration.getBackendURL()));

      try {
        setStatusText('Logging in...');
        await RestAPI.getUserInfo();
        dispatch(login());
      } catch (e) {
        console.error('Login failed');
        dispatch(logout());
      }
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
            <Spinner />
            <Text style={{color: theme['text-alternate-color']}}>{statusText}</Text>
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
