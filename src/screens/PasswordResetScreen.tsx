import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import RestAPI from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import {LoginBackdrop} from './LoginScreen/LoginBackdrop';
import {Button, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
import {PasswordValidationInput} from '../components/PasswordValidationInput';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'PasswordResetScreen'>;
export const PasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  const [newPassword, setNewPassword] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);


  const resetPassword = () => {
    if (!props.route.params?.id || passwordOk) {
      return;
    }
    RestAPI.resetPassword(props.route.params.id, newPassword).then(() => {
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
        successContent={t('screens.resetPassword.successPasswordReset.message')}
      />
      <View style={{flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>

        <Text style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
        <View style={CentralStyles.smallContentContainer}>
          <PasswordValidationInput
            onValidityChange={setPasswordOk}
            onPasswordChange={setNewPassword}
          />
          {/* t('screens.resetPassword.enterNewPassword') */}
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

