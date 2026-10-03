import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, StyleSheet, TextInput as RNTextInput, View} from 'react-native';
import {Button, Card, IconButton, Modal, Portal, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {useGetInstanceInfoQuery, useSignInMutation} from '../../api/endpoints/account';
import {FormErrorMessage} from '../../components/FormErrorMessage';
import {LegalLinks} from '../../components/LegalLinks';
import {PasswordInput} from '../../components/PasswordInput';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {resolveAppVersion} from '../../helper/appVersion';
import {adminAddress} from '../../helper/instanceAddress';
import {useInstanceFeatures} from '../../helper/useInstanceFeatures';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import {switchServer} from '../../redux/sessionThunks';
import {login} from '../../redux/features/authSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles, {OwnColors} from '../../styles/CentralStyles';
import {LoginBackdrop, LoginColumn, LoginNotice} from './LoginBackdrop';


const SETUP_POLL_INTERVAL_MS = 10_000;

type Props = NativeStackScreenProps<LoginNavigationProps, 'LoginScreen'>;

const LoginScreen = ({route, navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const backendUrl = useAppSelector((state) => state.settings.backendUrl);
  const [serverUrl, setServerUrl] = useState<string>(backendUrl);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();
  const [signIn, {isLoading: loginPending}] = useSignInMutation();
  const {setupRequired, signupMode} = useInstanceFeatures();
  // The administrator finishes the setup in another window; the notice goes away on its own.
  useGetInstanceInfoQuery(undefined, {pollingInterval: setupRequired ? SETUP_POLL_INTERVAL_MS : 0});

  const passwordInputRef = useRef<RNTextInput>(null);

  const dispatch = useAppDispatch();

  const {t} = useTranslation('translation');

  const doLogin = () => {
    if (loginPending || !email || !password) {
      return;
    }
    setApiErrorMessage(undefined);
    signIn({emailAddress: email, password}).unwrap()
        .then(() => dispatch(login()))
        .catch((error) => setApiErrorMessage(t(errorMessageKey(error))));
  };

  useEffect(() => setServerUrl(backendUrl), [backendUrl]);

  const newAccountAddress = route.params?.emailAddress;
  useEffect(() => {
    newAccountAddress && setEmail(newAccountAddress);
  }, [newAccountAddress]);

  // Translated here rather than in the helper so the app's typed translation
  // keys stay checked at the call site.
  const versionLabel = () => {
    const {version, build} = resolveAppVersion();
    if (!version) {
      return '';
    }
    return build ?
      t('common.appVersionWithBuild', {version, build}) :
      t('common.appVersion', {version});
  };

  const settingsModal = (
    // Paper renders a Modal inline unless it is wrapped in a Portal, which left this one
    // in the same stacking context as the login form - the floating labels of the e-mail
    // and password fields drew on top of it. A Portal renders into the host that
    // PaperProvider mounts at the root of the app, above every screen.
    <Portal>
      <Modal
        visible={settingsModalVisible}
        onDismiss={() => setSettingsModalVisible(false)}
        // `style` is the full screen wrapper, the card belongs in the content style
        contentContainerStyle={CentralStyles.smallContentContainer}>
        <Card>
          <TextInput label="Server URL" value={serverUrl} onChangeText={(text) => setServerUrl(text)} />
          <Button onPress={() => {
            dispatch(switchServer(serverUrl))
                .then(() => setSettingsModalVisible(false))
                .catch((error) => console.error('Saving the server address failed', error));
          }}>
            {t('common.save')}
          </Button>
        </Card>
      </Modal>
    </Portal>
  );


  const signInForm = (
    <>
      <TextInput
        testID='usernameInput'
        mode="flat"
        dense={true}
        value={email}
        keyboardType='email-address'
        autoCapitalize='none'
        autoComplete='email'
        autoCorrect={false}
        returnKeyType='next'
        submitBehavior='submit'
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        onChangeText={setEmail}
        label="E-Mail" />
      <Spacer height={10} />
      <PasswordInput
        ref={passwordInputRef}
        testID='passwordInput'
        password={password}
        setPassword={setPassword}
        label={t('screens.login.password')}
        returnKeyType='go'
        onSubmitEditing={doLogin}
      />
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
        loading={loginPending}
        disabled={loginPending || !email || !password}
        onPress={doLogin}>Login</Button>
      <FormErrorMessage testID='loginError' message={apiErrorMessage} />
      {signupMode === 'OPEN' &&
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
      }
      {signupMode === 'INVITATION_ONLY' &&
        <Text testID='invitationOnly' style={styles.invitationOnly}>{t('screens.login.invitationOnly')}</Text>
      }
    </>
  );

  return (
    <LoginBackdrop>
      <IconButton
        icon="cog"
        iconColor={OwnColors.bluishGrey}
        size={20}
        onPress={() => setSettingsModalVisible(true)}
      />
      <LoginColumn>
        <Text style={CentralStyles.loginTitle}>CookPal</Text>
        {setupRequired ? <SetupRequiredNotice instance={backendUrl} /> : signInForm}
      </LoginColumn>
      <View style={styles.footer}>
        <LegalLinks color={OwnColors.bluishGrey} />
        <Text style={styles.version}>{versionLabel()}</Text>
      </View>
      {settingsModal}
    </LoginBackdrop>
  );
};

/**
 * Stands in for the form while the instance has no administrator: nobody can sign in or sign up
 * before the setup, which happens in the administration.
 *
 * @param {object} props the instance that is not set up
 * @return {JSX.Element} what to do instead
 */
const SetupRequiredNotice = (props: {instance: string}) => {
  const {t} = useTranslation('translation');
  const address = adminAddress(props.instance);
  return (
    <LoginNotice
      testID='setupRequired'
      message={t('screens.login.setupRequired', {address})}
      actionLabel={t('screens.login.openAdministration')}
      onAction={() => Linking.openURL(address)} />
  );
};

const styles = StyleSheet.create({
  invitationOnly: {
    color: OwnColors.bluishGrey,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
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
});

export default LoginScreen;
