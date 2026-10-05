import React, {useRef, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {TextInput as RNTextInput, View} from 'react-native';
import {Button, Checkbox, MD3Colors, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {useSignUpMutation} from '../api/endpoints/account';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {PromptUtil} from '../helper/Prompt';
import {SIGNUP_OUTCOME_KEYS} from '../helper/signupOutcome';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {EmailValidationInput} from './EmailValidationInput';
import {FormErrorMessage} from './FormErrorMessage';
import {GoogleSignIn} from './GoogleSignIn';
import {useLegalDocumentLinks} from './LegalLinks';
import {PasswordValidationInput} from './PasswordValidationInput';

interface Props {
  /** The token of the invitation link the account is created with; absent for an open sign up. */
  invitation?: string;
  /** Called once the account exists and its owner has been told what happens next. */
  onSignedUp: (emailAddress: string) => void;
}

/**
 * The form that creates an account, for an open sign up and for an invitation alike. What differs
 * is only whether a token goes along; what became of the account is the server's answer.
 *
 * @param {Props} props the invitation, if any, and what to do once the account exists
 * @return {JSX.Element} the form
 */
export const SignupForm = (props: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailOk, setEmailOk] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);
  const [signUp, {isLoading: registerPending}] = useSignUpMutation();

  const emailRef = useRef<RNTextInput>(null);
  const passwordSectionRef = useRef<{focus:() => void}>(null);

  const {t} = useTranslation('translation');
  const {colors} = useAppTheme();
  const legalLinks = useLegalDocumentLinks();

  const allFieldsOk = passwordOk && password && emailOk && termsAccepted;

  const register = () => {
    if (registerPending || !allFieldsOk) {
      return;
    }
    setApiErrorMessage(undefined);
    signUp({emailAddress: email, password, invitation: props.invitation}).unwrap().then(({state}) => {
      props.onSignedUp(email);
      PromptUtil.show({
        confirm: t('common.ok'),
        message: t(SIGNUP_OUTCOME_KEYS[state].message),
        title: t(SIGNUP_OUTCOME_KEYS[state].title),
      });
    }).catch((error) => {
      setApiErrorMessage(t(errorMessageKey(error)));
    });
  };

  return (
    <>
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
            components={legalLinks}
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
      <GoogleSignIn invitation={props.invitation} />
    </>
  );
};
