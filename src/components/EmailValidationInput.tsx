import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {TextInput} from 'react-native-paper';

interface Props {
    value: string;
    onValidityChange: (valid: boolean) => void;
    onChangeText: (text: string) => void;
}

export const EmailValidationInput = (props: Props) => {
  const {t} = useTranslation('translation');
  const [error, setError] = useState(false);

  const updateValidation = (newEmail: string) => {
    const newState = isEmailValid(newEmail);
    if (newState !== error) {
      props.onValidityChange(newState);
    }
    setError(newState);
  };

  return (
    <TextInput
      dense={true}
      mode="flat"
      value={props.value}
      onChangeText={(text) => {
        updateValidation(text);
        props.onChangeText(text);
      }}
      error={!error && props.value.length > 0}
      label={t('common.email')}/>
  );
};

const isEmailValid = (email: string): boolean => {
  const matches = String(email)
      .toLowerCase()
      .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  return matches ? true : false;
};
