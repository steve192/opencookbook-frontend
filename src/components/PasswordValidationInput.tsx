import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NativeSyntheticEvent, TextInput as RNTextInput, TextInputSubmitEditingEventData} from 'react-native';
import {HelperText} from 'react-native-paper';
import Spacer from 'react-spacer';
import {PasswordInput} from './PasswordInput';

interface Props {
  onValidityChange: (valid: boolean) => void;
  onPasswordChange: (newPassword: string) => void;
  /** Forwarded to the *confirm* field so the parent can chain Enter into submit. */
  confirmReturnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitConfirm?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
}

// Expose `.focus()` so a parent (e.g. SignupScreen's email field) can move focus
// here on Enter without having to know about the two underlying inputs.
export const PasswordValidationInput = forwardRef<{focus:() => void}, Props>((props, ref) => {
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => passwordRef.current?.focus(),
  }));

  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsMatching, setPasswordsMatching] = useState(true);

  const {t} = useTranslation('translation');

  useEffect(() => {
    const matching = password === confirmedPassword;
    if (matching !== passwordsMatching) {
      props.onValidityChange(matching);
    }
    setPasswordsMatching(matching);
    if (matching) {
      props.onPasswordChange(password);
    }
  }, [password, confirmedPassword]);

  return (
    <>
      <PasswordInput
        ref={passwordRef}
        password={password}
        setPassword={setPassword}
        label={t('screens.login.password')}
        returnKeyType='next'
        onSubmitEditing={() => confirmRef.current?.focus()} />
      <Spacer height={5} />
      <PasswordInput
        ref={confirmRef}
        password={confirmedPassword}
        setPassword={setConfirmedPassword}
        label={t('screens.login.passwordConfirm')}
        error={!passwordsMatching}
        returnKeyType={props.confirmReturnKeyType}
        onSubmitEditing={props.onSubmitConfirm} />

      <HelperText type="error" visible={!passwordsMatching}>{t('screens.login.errorNoPasswordMatch')}</HelperText>
    </>
  );
});
PasswordValidationInput.displayName = 'PasswordValidationInput';
