import React from 'react';
import {View} from 'react-native';
import {IconButton, TextInput, TextInputProps, withTheme} from 'react-native-paper';


export const RecipeFormField = withTheme((inputProps: TextInputProps & { onRemovePress: Function }) => {
  return (

    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      <TextInput
        mode='outlined'
        style={{flex: 1}}
        {...inputProps} />
      <IconButton
        icon="delete-outline"
        onPress={() => inputProps.onRemovePress()} />

    </View>
  );
});
