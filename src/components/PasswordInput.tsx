import React, {useMemo, useState} from 'react';
import {TextInput} from 'react-native-paper';

interface Props {
  password: string,
  setPassword: (newPassword: string) => void,
  label: string,
  error?: boolean,
}

const ICON_INPUT_HIDDEN = 'eye-off';
const ICON_INPUT_VISIBLE = 'eye';

export const PasswordInput = (props: Props) => {
  const [inputHidden, setInputHidden] = useState<boolean>(true);

  const toggleHiddenIcon = useMemo(
      () => (
        <TextInput.Icon
          icon={inputHidden ? ICON_INPUT_HIDDEN : ICON_INPUT_VISIBLE}
          onPress={() => setInputHidden(!inputHidden)}
          forceTextInputFocus={false}
        />
      ), [inputHidden],
  );

  return (
    <TextInput
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
