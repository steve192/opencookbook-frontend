import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import RestAPI from '../../dao/RestAPI';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import {Button, Colors, ProgressBar, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PromptUtil} from '../../helper/Prompt';
import {SuccessErrorBanner} from '../../components/SuccessErrorBanner';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'RequestPasswordResetScreen'>;
export const RequestPasswordResetScreen = (props: Props) => {
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
          <Text style={CentralStyles.loginTitle}>{t('screens.resetPassword.title')}</Text>
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

