import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {HelperText, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';

interface Props {
    onValidityChange: (valid: boolean) => void;
    onPasswordChange: (newPassword: string) => void;
}

export const PasswordValidationInput = (props: Props) => {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsMatching, setPasswordsMatching] = useState(true);

  const {t} = useTranslation('translation');

  useEffect(() => {
    const newState = password === confirmedPassword;
    if (newState !== passwordsMatching) {
      props.onValidityChange(newState);
    }
    setPasswordsMatching(newState);
    if (newState) {
      props.onPasswordChange(password);
    }
  }, [password, confirmedPassword]);

  return (
    <>
      <TextInput
        dense={true}
        mode="flat"
        value={password}
        onChangeText={setPassword}
        label={t('screens.login.password')}
        secureTextEntry={true} />
      <Spacer height={5} />
      <TextInput
        dense={true}
        mode="flat"
        value={confirmedPassword}
        onChangeText={setConfirmedPassword}
        label={t('screens.login.passwordConfirm')}
        error={!passwordsMatching}
        secureTextEntry={true} />

      <HelperText type="error" visible={!passwordsMatching} >{t('screens.login.errorNoPasswordMatch')}</HelperText>
    </>
  );
};
