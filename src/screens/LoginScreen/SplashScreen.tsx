import NetInfo from '@react-native-community/netinfo';
import * as Updates from 'expo-updates';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import AppPersistence from '../../AppPersistence';
import RestAPI from '../../dao/RestAPI';
import {login, logout} from '../../redux/features/authSlice';
import {changeBackendUrl, changeOnlineState} from '../../redux/features/settingsSlice';
import {useAppDispatch} from '../../redux/hooks';
import {LoginBackdrop} from './LoginBackdrop';
import {useAppTheme} from '../../styles/CentralStyles';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';


export const SplashScreen = () => {
  const [statusText, setStatusText] = useState('');
  const dispatch = useAppDispatch();
  const theme= useAppTheme();

  const {t} = useTranslation('translation');


  useEffect(() => {
    (async () => {
      NetInfo.addEventListener((state) => {
        if (Platform.OS === 'android') {
          dispatch(changeOnlineState(state.isInternetReachable === true));
        } else {
          dispatch(changeOnlineState(state.isConnected === true));
        }
      });


      // Check for new app versions
      const info = await NetInfo.fetch();
      if (info.isInternetReachable) {
        // Do update asynchronously
        const updateAsync = async () => {
          console.log('Update check');
          await new Promise((r) => setTimeout(r, 1000));
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log('Dowload update');
            await Updates.fetchUpdateAsync();
            console.log('Restarting app');

            SnackbarUtil.show({message: t('common.update.restartprompt'), button1: t('common.update.restartbutton'), button1Callback: () => {
              AppPersistence.clearOfflineData().then(() => {
                Updates.reloadAsync()
                    .then((r) => console.log('Restart triggered', r))
                    .catch((e) => console.error('Restarting failed', e));
              });
            }});
          }
        };
        updateAsync();
      }

      // TODO: Proper management of backend url via redux
      dispatch(changeBackendUrl(await AppPersistence.getBackendURL()));

      setStatusText(t('screens.splash.loggingin'));
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
