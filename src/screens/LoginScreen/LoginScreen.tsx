import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AxiosError} from 'axios';
import Constants from 'expo-constants';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Card, IconButton, Modal, Text, TextInput} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import Spacer from 'react-spacer';
import AppPersistence from '../../AppPersistence';
import {PasswordInput} from '../../components/PasswordInput';
import RestAPI from '../../dao/RestAPI';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import {login} from '../../redux/features/authSlice';
import CentralStyles, {OwnColors, useAppTheme} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';


type Props = NativeStackScreenProps<LoginNavigationProps, 'LoginScreen'>;

const LoginScreen = ({route, navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();

  const dispatch = useDispatch();

  const {t} = useTranslation('translation');
  const {colors} = useAppTheme();

  const doLogin = () => {
    RestAPI.authenticate(email, password).then(() => {
      dispatch(login());
    }).catch((error: AxiosError) => {
      // @ts-ignore
      if (error.response?.status === 401 && error?.response?.data?.userActive === false) {
        setApiErrorMessage(t('screens.login.inactiveaccount'));
      } else if (error.response?.status === 401) {
        setApiErrorMessage(t('screens.login.invaliduserpass'));
      } else {
        setApiErrorMessage(t('common.unknownerror'));
      }
    });
  };

  useEffect(() => {
    AppPersistence.getBackendURL().then(setServerUrl);
  }, []);

  const settingsModal = (
    <Modal
      style={[CentralStyles.contentContainer]}
      visible={settingsModalVisible}
      onDismiss={() => setSettingsModalVisible(false)}>
      <Card>
        <TextInput label="Server URL" value={serverUrl} onChangeText={(text) => setServerUrl(text)} />
        <Button onPress={() => {
          AppPersistence.setBackendURL(serverUrl).then(() => {
            setSettingsModalVisible(false);
          });
        }}>
          {t('common.save')}
        </Button>
      </Card>
    </Modal>
  );


  return (
    <LoginBackdrop>
      <IconButton
        icon="cog"
        iconColor={OwnColors.bluishGrey}
        size={20}
        onPress={() => setSettingsModalVisible(true)}
      />
      <View style={styles.loginContainer}>
        <View style={CentralStyles.smallContentContainer}>
          <Text style={CentralStyles.loginTitle}>CookPal</Text>
          <TextInput testID='usernameInput' mode="flat" dense={true} value={email} keyboardType='email-address' onChangeText={(text) => setEmail(text)} label="E-Mail" />
          <Spacer height={10} />
          <PasswordInput testID='passwordInput' password={password} setPassword={setPassword} label={t('screens.login.password')} />
          <View style={styles.forgotPasswordContainer}>
            <Button
              testID='forgotPassword'
              textColor={OwnColors.bluishGrey}
              compact={true}
              uppercase={false}
              labelStyle={{fontWeight: 'bold'}}
              onPress={() => navigation.navigate('RequestPasswordResetScreen')}>
              {t('screens.login.forgotPassword')}
            </Button>
          </View>
          <Button
            testID='loginButton'
            mode="contained"
            labelStyle={{fontWeight: 'bold', color: 'white'}}
            style={CentralStyles.elementSpacing}
            onPress={doLogin}>Login</Button>
          {apiErrorMessage && <Text theme={{colors: {text: colors.error}}}>{apiErrorMessage}</Text>}
          <Button
            testID='SignUpButton'
            textColor={OwnColors.bluishGrey}
            compact={true}
            uppercase={false}
            labelStyle={{fontWeight: 'bold'}}
            onPress={() => navigation.navigate('SignupScreen')}
          >
            {t('screens.login.createAccount')}
          </Button>
        </View>
      </View>
      <Text style={styles.footer}>{Constants.expoConfig?.version} @ {Constants.expoConfig?.extra?.buildTime}</Text>
      {settingsModal}
    </LoginBackdrop>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    fontSize: 10,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

export default LoginScreen;
