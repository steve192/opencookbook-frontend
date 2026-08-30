import React, {forwardRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NativeSyntheticEvent, TextInput as RNTextInput, TextInputSubmitEditingEventData} from 'react-native';
import {TextInput} from 'react-native-paper';

interface Props {
    value: string;
    onValidityChange: (valid: boolean) => void;
    onChangeText: (text: string) => void;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
    submitBehavior?: 'submit' | 'blurAndSubmit' | 'newline';
}

const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isEmailValid = (email: string): boolean => EMAIL_PATTERN.test(email.toLowerCase());

export const EmailValidationInput = forwardRef<RNTextInput, Props>((props, ref) => {
  const {t} = useTranslation('translation');
  // Tracks whether the current value parses as an email. Notify the parent only
  // when validity flips, so they don't re-render on every keystroke.
  const [isValid, setIsValid] = useState(false);

  const handleChange = (newEmail: string) => {
    const nowValid = isEmailValid(newEmail);
    if (nowValid !== isValid) {
      setIsValid(nowValid);
      props.onValidityChange(nowValid);
    }
    props.onChangeText(newEmail);
  };

  return (
    <TextInput
      ref={ref}
      dense={true}
      mode="flat"
      value={props.value}
      onChangeText={handleChange}
      // Only surface the error state once the user has typed something — an
      // empty field on first render shouldn't look like a validation error.
      error={!isValid && props.value.length > 0}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      autoCorrect={false}
      returnKeyType={props.returnKeyType}
      onSubmitEditing={props.onSubmitEditing}
      submitBehavior={props.submitBehavior}
      label={t('common.email')}/>
  );
});
EmailValidationInput.displayName = 'EmailValidationInput';
