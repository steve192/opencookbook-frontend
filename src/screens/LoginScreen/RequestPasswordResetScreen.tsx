import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {EmailValidationInput} from '../../components/EmailValidationInput';
import {SuccessErrorBanner} from '../../components/SuccessErrorBanner';
import RestAPI from '../../dao/RestAPI';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';

type Props = NativeStackScreenProps<LoginNavigationProps, 'RequestPasswordResetScreen'>;
export const RequestPasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const resetPassword = () => {
    if (pending || !emailValid) {
      return;
    }
    setPending(true);
    setError(false);
    RestAPI.requestPasswordReset(emailAddress).then(() => {
      setSuccess(true);
    }).catch(() => {
      setError(true);
      setSuccess(false);
    }).finally(() => setPending(false));
  };

  return (
    <LoginBackdrop>
      <SuccessErrorBanner
        error={error}
        success={success}
        pending={false}
        pendingContent=""
        errorContent={t('screens.resetPassword.unknownErrorSendingRequest')}
        successContent={t('screens.resetPassword.successRequestSent.message')}
      />
      <View style={{flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>

        <View style={CentralStyles.smallContentContainer}>
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
        </View>
      </View>
    </LoginBackdrop>
  );
};
