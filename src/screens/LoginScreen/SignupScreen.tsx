import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {StyleSheet, Text as RNText, TextInput as RNTextInput, View} from 'react-native';
import {Button, Checkbox, MD3Colors, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {EmailValidationInput} from '../../components/EmailValidationInput';
import {FormErrorMessage} from '../../components/FormErrorMessage';
import {PasswordValidationInput} from '../../components/PasswordValidationInput';
import {useSignUpMutation} from '../../api/endpoints/account';
import {LegalDocument} from '../../api/types/legal';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {PromptUtil} from '../../helper/Prompt';
import {BaseNavigatorProps, LoginNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';

type Props = CompositeScreenProps<
NativeStackScreenProps<LoginNavigationProps, 'SignupScreen'>,
NativeStackScreenProps<BaseNavigatorProps, 'LegalDocumentScreen'>
>
export const SignupScreen = (props: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [emailOk, setEmailOk] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);
  const [signUp, {isLoading: registerPending}] = useSignUpMutation();

  const emailRef = useRef<RNTextInput>(null);
  const passwordSectionRef = useRef<{focus:() => void}>(null);

  const {t} = useTranslation('translation');
  const {colors} = useAppTheme();

  const allFieldsOk = passwordOk && password && emailOk && termsAccepted;

  const legalLink = (document: LegalDocument) => (
    <RNText
      onPress={() => props.navigation.navigate('LegalDocumentScreen', {document})}
      style={{color: colors.primary}} />
  );

  const register = () => {
    if (registerPending || !allFieldsOk) {
      return;
    }
    setApiErrorMessage(undefined);
    signUp({emailAddress: email, password}).unwrap().then(() => {
      props.navigation.goBack();
      PromptUtil.show({
        confirm: t('common.ok'),
        message: t('screens.login.activationpending'),
        title: t('screens.login.activationpendingtitle'),
      });
    }).catch((error) => {
      setApiErrorMessage(t(errorMessageKey(error)));
    });
  };


  return (
    <LoginBackdrop>
      <View style={styles.loginContainer}>
        <View style={CentralStyles.smallContentContainer}>
          <Text testID="signup-title" style={CentralStyles.loginTitle}>{t('screens.login.register')}</Text>
          <EmailValidationInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            onValidityChange={setEmailOk}
            returnKeyType='next'
            submitBehavior='submit'
            onSubmitEditing={() => passwordSectionRef.current?.focus()}
          />
          <Spacer height={20} />
          <PasswordValidationInput
            ref={passwordSectionRef}
            onValidityChange={setPasswordOk}
            onPasswordChange={setPassword}
            confirmReturnKeyType='go'
            onSubmitConfirm={register}
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
              <Trans
                t={t}
                i18nKey="screens.login.acceptTerms"
                components={{terms: legalLink('terms'), privacy: legalLink('privacy')}}
              />
            </Text>
          </View>
          <Spacer height={20} />
          <Button
            mode="contained"
            theme={{dark: true}}
            disabled={!allFieldsOk || registerPending}
            loading={registerPending}
            style={CentralStyles.elementSpacing}
            onPress={register}>{t('screens.login.register')}</Button>
          <FormErrorMessage testID='signupError' message={apiErrorMessage} />
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
