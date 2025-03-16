import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import RestAPI from '../../dao/RestAPI';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import {Button, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {SuccessErrorBanner} from '../../components/SuccessErrorBanner';

export const RequestPasswordResetScreen = () => {
  const {t} = useTranslation('translation');
  const [emailAddress, setEmailAddress] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPassword = () => {
    RestAPI.requestPasswordReset(emailAddress).then(() => {
      setSuccess(true);
      setError(false);
    }).catch(() => {
      setError(true);
      setSuccess(false);
    });
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
          <TextInput
            dense={true}
            onChangeText={setEmailAddress}
            label={t('common.email')}/>
          <Spacer height={20}/>
          <Button
            mode='contained'
            onPress={resetPassword}
          >{t('screens.resetPassword.resetPasswordButton')}</Button>
        </View>
      </View>
    </LoginBackdrop>
  );
};

