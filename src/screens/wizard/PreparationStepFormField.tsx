import {Button, useTheme} from '@ui-kitten/components';
import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {TextInputProps} from 'react-native-paper/lib/typescript/components/TextInput/TextInput';
import {DeleteIcon} from '../../assets/Icons';


export const RecipeFormField = (inputProps: TextInputProps & { onRemovePress: Function }) => {
  const theme = useTheme();
  return (

    <View style={{alignItems: 'center', flexDirection: 'row'}}>
      <TextInput
        mode='outlined'
        style={{flex: 1}}
        {...inputProps} />
      <Button
        style={{height: 32, width: 32, margin: 10}}
        size="small"
        status="control"
        accessoryLeft={<DeleteIcon />}
        onPress={() => inputProps.onRemovePress()} />

    </View>
  );
};
