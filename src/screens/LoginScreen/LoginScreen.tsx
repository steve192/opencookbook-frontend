import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AxiosError} from 'axios';
import Constants from 'expo-constants';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import Spacer from 'react-spacer';
import Configuration from '../../Configuration';
import RestAPI from '../../dao/RestAPI';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import {login} from '../../redux/features/authSlice';
import CentralStyles, {OwnColors} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import {Button, Card, Colors, IconButton, Modal, Text, TextInput, useTheme} from 'react-native-paper';


type Props = NativeStackScreenProps<LoginNavigationProps, 'LoginScreen'>;

const LoginScreen = ({route, navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();

  const dispatch = useDispatch();

  const {t} = useTranslation('translation');
  const {colors} = useTheme();

  const doLogin = () => {
    RestAPI.authenticate(email, password).then(() => {
      dispatch(login());
    }).catch((error: AxiosError) => {
      if (error.response?.status === 401) {
        setApiErrorMessage(t('screens.login.invaliduserpass'));
      } else if (error.response?.status === 403 && !error.response.data.userActive) {
        setApiErrorMessage(t('screens.login.inactiveaccount'));
      } else {
        setApiErrorMessage(t('common.unknownerror'));
      }
    });
  };

  useEffect(() => {
    Configuration.getBackendURL().then(setServerUrl);
  }, []);

  const settingsModal = (
    <Modal
      style={[CentralStyles.contentContainer]}
      visible={settingsModalVisible}
      onDismiss={() => setSettingsModalVisible(false)}>
      <Card>
        <TextInput label="Server URL" value={serverUrl} onChangeText={(text) => setServerUrl(text)} />
        <Button onPress={() => {
          Configuration.setBackendURL(serverUrl).then(() => {
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
        color={OwnColors.bluishGrey}
        size={20}
        onPress={() => setSettingsModalVisible(true)}
      />
      <View style={styles.loginContainer}>
        <View style={styles.innerLoginContainer}>
          <Text style={styles.title}>CookPal</Text>
          <TextInput mode="flat" dense={true} value={email} keyboardType='email-address' onChangeText={(text) => setEmail(text)} label="E-Mail"/>
          <Spacer height={10} />
          <TextInput mode="flat" dense={true} value={password} onChangeText={(text) => setPassword(text)} label="Password" secureTextEntry={true} />
          <View style={styles.forgotPasswordContainer}>
            <Button
              color={OwnColors.bluishGrey}
              compact={true}
              uppercase={false}
              labelStyle={{fontWeight: 'bold'}}
              onPress={() => null}>
              {t('screens.login.forgotPassword')}
            </Button>
          </View>
          <Button
            mode="contained"
            labelStyle={{fontWeight: 'bold', color: 'white'}}
            style={CentralStyles.elementSpacing}
            onPress={doLogin}>Login</Button>
          {apiErrorMessage && <Text theme={{colors: {text: colors.error}}}>{apiErrorMessage}</Text>}
          <Button
            color={OwnColors.bluishGrey}
            compact={true}
            uppercase={false}
            labelStyle={{fontWeight: 'bold'}}
            onPress={() => navigation.navigate('SignupScreen')}
          >
            {t('screens.login.createAccount')}
          </Button>
        </View>
      </View>
      <Text style={styles.footer}>Alpha build @ {Constants.manifest?.extra?.buildTime}</Text>
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

export default LoginScreen;
