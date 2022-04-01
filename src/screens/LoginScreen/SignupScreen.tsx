import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, StyleSheet, View} from 'react-native';
import Spacer from 'react-spacer';
import RestAPI from '../../dao/RestAPI';
import {PromptUtil} from '../../helper/Prompt';
import {LoginNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import {Checkbox, Button, Text, useTheme, Colors} from 'react-native-paper';
import {EmailValidationInput} from '../../components/EmailValidationInput';
import {PasswordValidationInput} from '../../components/PasswordValidationInput';


type Props = NativeStackScreenProps<LoginNavigationProps, 'SignupScreen'>;

export const SignupScreen = (props: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [emailOk, setEmailValid] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);


  const {t} = useTranslation('translation');
  const {colors} = useTheme();


  const register = () => {
    RestAPI.registerUser(email, password).then(() => {
      setApiErrorMessage('');
      props.navigation.goBack();
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
          <Text style={CentralStyles.loginTitle}>{t('screens.login.register')}</Text>
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
              uncheckedColor={colors.surface}
              onPress={() => setTermsAccepted(!termsAccepted)} />
            <Text
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={{paddingLeft: 10, color: 'white'}}>
              {t('screens.login.acceptTOC')}{' '}
              <Text
                onPress={() => props.navigation.navigate('TermsOfServiceScreen')}
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
          <Text style={{fontWeight: 'bold', color: Colors.red200, textAlign: 'center'}}>{apiErrorMessage}</Text>
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
