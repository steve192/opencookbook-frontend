import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {EmailValidationInput} from '../../components/EmailValidationInput';
import {SuccessErrorBanner} from '../../components/SuccessErrorBanner';
import {useRequestPasswordResetMutation} from '../../api/endpoints/account';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {useInstanceFeatures} from '../../helper/useInstanceFeatures';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop, LoginColumn, LoginNotice} from './LoginBackdrop';

type Props = NativeStackScreenProps<LoginNavigationProps, 'RequestPasswordResetScreen'>;
export const RequestPasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [requestPasswordReset, {isLoading: pending}] = useRequestPasswordResetMutation();
  const {mailEnabled} = useInstanceFeatures();

  const resetPassword = () => {
    if (pending || !emailValid) {
      return;
    }
    setError(undefined);
    requestPasswordReset(emailAddress).unwrap().then(() => {
      setSuccess(true);
    }).catch((cause) => {
      setError(t(errorMessageKey(cause)));
      setSuccess(false);
    });
  };

  if (!mailEnabled) {
    return (
      <LoginBackdrop>
        <LoginColumn>
          <Text style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
          <LoginNotice
            testID="password-reset-no-mail"
            message={t('screens.resetPassword.noMail')}
            actionLabel={t('screens.resetPassword.backToLogin')}
            onAction={() => props.navigation.popTo('LoginScreen')} />
        </LoginColumn>
      </LoginBackdrop>
    );
  }

  return (
    <LoginBackdrop>
      <SuccessErrorBanner
        error={!!error}
        success={success}
        pending={false}
        pendingContent=""
        errorContent={error ?? ''}
        successContent={t('screens.resetPassword.successRequestSent.message')}
      />
      <LoginColumn>
        <Text testID="password-reset-title" style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
        <EmailValidationInput
          value={emailAddress}
          onChangeText={setEmailAddress}
          onValidityChange={setEmailValid}
          returnKeyType='go'
          onSubmitEditing={resetPassword} />
        <Spacer height={20}/>
        <Button
          mode='contained'
          loading={pending}
          disabled={pending || !emailValid}
          onPress={resetPassword}
        >{t('screens.resetPassword.resetPasswordButton')}</Button>
      </LoginColumn>
    </LoginBackdrop>
  );
};
