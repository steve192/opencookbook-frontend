import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {PasswordValidationInput} from '../components/PasswordValidationInput';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
import RestAPI from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import {LoginBackdrop} from './LoginScreen/LoginBackdrop';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'PasswordResetScreen'>;
export const PasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  const [newPassword, setNewPassword] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const resetPassword = () => {
    if (pending || !props.route.params?.id || !passwordOk) {
      return;
    }
    setPending(true);
    setError(false);
    RestAPI.resetPassword(props.route.params.id, newPassword).then(() => {
      setSuccess(true);
    }).catch(() => {
      setError(true);
      setSuccess(false);
    }).finally(() => setPending(false));
  };

  // Replace the in-stack screen with the login flow so the user can't navigate
  // back into a now-stale password-reset link.
  const goToLogin = () => props.navigation.reset({
    index: 0,
    routes: [{name: 'default'}],
  });

  const resetForm = (
    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Text style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
      <View style={CentralStyles.smallContentContainer}>
        <PasswordValidationInput
          onValidityChange={setPasswordOk}
          onPasswordChange={setNewPassword}
          confirmReturnKeyType='go'
          onSubmitConfirm={resetPassword}
        />
        <Spacer height={20}/>
        <Button
          disabled={!passwordOk || newPassword.length === 0 || pending}
          loading={pending}
          mode='contained'
          theme={{dark: true}}
          onPress={resetPassword}
        >{t('screens.resetPassword.resetPasswordButton')}</Button>
      </View>
    </View>
  );

  const successView = (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={CentralStyles.smallContentContainer}>
        <Spacer height={20}/>
        <Button mode='contained' theme={{dark: true}} onPress={goToLogin}>
          Login
        </Button>
      </View>
    </View>
  );

  return (
    <LoginBackdrop>
      <SuccessErrorBanner
        error={error}
        success={success}
        pending={false}
        pendingContent=""
        errorContent={t('screens.resetPassword.unknownErrorSendingRequest')}
        successContent={t('screens.resetPassword.successPasswordReset.message')}
      />
      {success ? successView : resetForm}
    </LoginBackdrop>
  );
};
