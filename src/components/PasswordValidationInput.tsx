import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {HelperText} from 'react-native-paper';
import Spacer from 'react-spacer';
import {PasswordInput} from './PasswordInput';

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
      <PasswordInput
        password={password}
        setPassword={setPassword}
        label={t('screens.login.password')} />
      <Spacer height={5} />
      <PasswordInput
        password={confirmedPassword}
        setPassword={setConfirmedPassword}
        label={t('screens.login.passwordConfirm')}
        error={!passwordsMatching} />

      <HelperText type="error" visible={!passwordsMatching} >{t('screens.login.errorNoPasswordMatch')}</HelperText>
    </>
  );
};
