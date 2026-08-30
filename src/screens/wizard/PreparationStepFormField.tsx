import React from 'react';
import {View} from 'react-native';
import {IconButton, TextInput, TextInputProps} from 'react-native-paper';


type Props = TextInputProps & {
  onRemovePress: () => void;
};

export const RecipeFormField = ({onRemovePress, ...inputProps}: Props) => {
  return (
    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      <TextInput
        mode='outlined'
        style={{flex: 1}}
        {...inputProps} />
      <IconButton
        icon="delete-outline"
        onPress={onRemovePress} />
    </View>
  );
};
