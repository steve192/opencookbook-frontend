import {Router} from 'expo-router';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Checkbox, MD3Colors, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {EmailValidationInput} from '../../components/EmailValidationInput';
import {PasswordValidationInput} from '../../components/PasswordValidationInput';
import RestAPI from '../../dao/RestAPI';
import {PromptUtil} from '../../helper/Prompt';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';

type Props = {router: Router}
export const SignupScreen = (props: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [emailOk, setEmailValid] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);


  const {t} = useTranslation('translation');
  const {colors} = useAppTheme();


  const register = () => {
    RestAPI.registerUser(email, password).then(() => {
      setApiErrorMessage('');
      props.router.back();
      PromptUtil.show({
        button2: t('common.ok'),
        message: t('screens.login.activationpending'),
        title: t('screens.login.activationpendingtitle'),
      });
    }).catch((error: Error) => {
      setApiErrorMessage(error.toString());
    });
  };


  const allFieldsOk = passwordOk && password && emailOk && termsAccepted;

  return (
    <LoginBackdrop>
      <View style={styles.loginContainer}>
        <View style={CentralStyles.smallContentContainer}>
          <Text testID="signup-title" style={CentralStyles.loginTitle}>{t('screens.login.register')}</Text>
          <EmailValidationInput
            value={email}
            onChangeText={setEmail}
            onValidityChange={setEmailValid}
          />
          <Spacer height={20} />
          <PasswordValidationInput
            onValidityChange={setPasswordOk}
            onPasswordChange={setPassword}
          />

          <Spacer height={20} />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Checkbox
              status={termsAccepted ? 'checked' : 'unchecked'}
              color={colors.primary}
              uncheckedColor={MD3Colors.neutralVariant100}
              onPress={() => setTermsAccepted(!termsAccepted)} />
            <Text
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={{paddingLeft: 10, color: 'white'}}>
              {t('screens.login.acceptTOC')}{' '}
              <Text
                onPress={() => props.router.navigate('/tos')}
                style={{color: colors.primary}}>
                {t('screens.login.toc')}
              </Text>
            </Text>
          </View>
          <Spacer height={20} />
          <Button
            mode="contained"
            theme={{dark: true}}
            disabled={allFieldsOk ? false : true}
            style={CentralStyles.elementSpacing}
            onPress={register}>{t('screens.login.register')}</Button>
          <Text style={{fontWeight: 'bold', color: MD3Colors.error0, textAlign: 'center'}}>{apiErrorMessage}</Text>
        </View>
      </View>
    </LoginBackdrop>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
  },

});
