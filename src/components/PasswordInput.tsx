import React, {useCallback, useMemo, useState} from 'react';
import {TextInput} from 'react-native-paper';

interface Props {
  password: string,
  setPassword: (newPassword: string) => void,
  label: string,
  error?: boolean,
  testID?: string,
}

const ICON_INPUT_HIDDEN = 'eye-off';
const ICON_INPUT_VISIBLE = 'eye';

export const PasswordInput = (props: Props) => {
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
      testID={props.testID}
      dense={true}
      mode="flat"
      value={props.password}
      onChangeText={props.setPassword}
      label={props.label}
      error={props.error}
      secureTextEntry={inputHidden}
      right={toggleHiddenIcon}
    />
  );
};
