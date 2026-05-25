import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {NativeSyntheticEvent, TextInput as RNTextInput, TextInputSubmitEditingEventData} from 'react-native';
import {TextInput} from 'react-native-paper';

interface Props {
  password: string,
  setPassword: (newPassword: string) => void,
  label: string,
  error?: boolean,
  testID?: string,
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send',
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void,
}

const ICON_INPUT_HIDDEN = 'eye-off';
const ICON_INPUT_VISIBLE = 'eye';

// forwardRef so callers can imperatively focus this field (e.g. the email
// field's onSubmitEditing handler tabs into the password field on Enter).
export const PasswordInput = forwardRef<RNTextInput, Props>((props, ref) => {
  const [inputHidden, setInputHidden] = useState<boolean>(true);

  const toggleInputHidden = useCallback(
      () => setInputHidden(!inputHidden),
      [inputHidden],
  );

  const toggleHiddenIcon = useMemo(
      () => (
        <TextInput.Icon
          icon={inputHidden ? ICON_INPUT_HIDDEN : ICON_INPUT_VISIBLE}
          onPress={toggleInputHidden}
          forceTextInputFocus={false}
        />
      ), [inputHidden],
  );

  return (
    <TextInput
      ref={ref}
      testID={props.testID}
      dense={true}
      mode="flat"
      value={props.password}
      onChangeText={props.setPassword}
      label={props.label}
      error={props.error}
      secureTextEntry={inputHidden}
      right={toggleHiddenIcon}
      returnKeyType={props.returnKeyType}
      onSubmitEditing={props.onSubmitEditing}
    />
  );
});
PasswordInput.displayName = 'PasswordInput';
