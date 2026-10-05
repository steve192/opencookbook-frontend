import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {PasswordValidationInput} from '../components/PasswordValidationInput';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
import {useResetPasswordMutation} from '../api/endpoints/account';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import {LoginBackdrop, LoginColumn} from './LoginScreen/LoginBackdrop';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'PasswordResetScreen'>;
export const PasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  const [newPassword, setNewPassword] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [resetPasswordTo, {isLoading: pending}] = useResetPasswordMutation();

  const resetPassword = () => {
    if (pending || !props.route.params?.id || !passwordOk) {
      return;
    }
    setError(undefined);
    resetPasswordTo({passwordResetId: props.route.params.id, newPassword}).unwrap().then(() => {
      setSuccess(true);
    }).catch((cause) => {
      setError(t(errorMessageKey(cause)));
      setSuccess(false);
    });
  };

  // Replace the in-stack screen with the login flow so the user can't navigate
  // back into a now-stale password-reset link.
  const goToLogin = () => props.navigation.reset({
    index: 0,
    routes: [{name: 'default'}],
  });

  const resetForm = (
    <>
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
    </>
  );

  const successView = (
    <>
      <Spacer height={20}/>
      <Button mode='contained' theme={{dark: true}} onPress={goToLogin}>
        Login
      </Button>
    </>
  );

  return (
    <LoginBackdrop>
      <LoginColumn>
        <Text style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
        <SuccessErrorBanner
          error={!!error}
          success={success}
          pending={false}
          pendingContent=""
          errorContent={error ?? ''}
          successContent={t('screens.resetPassword.successPasswordReset.message')}
        />
        {success ? successView : resetForm}
      </LoginColumn>
    </LoginBackdrop>
  );
};
