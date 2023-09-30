import React, {ComponentProps} from 'react';
import {View} from 'react-native';
import {IconButton, TextInput, withTheme} from 'react-native-paper';


export const RecipeFormField = withTheme((inputProps: ComponentProps<typeof TextInput> & { onRemovePress: Function }) => {
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
