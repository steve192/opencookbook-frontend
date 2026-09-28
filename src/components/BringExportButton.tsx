import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, ViewStyle} from 'react-native';
import {Avatar, Button} from 'react-native-paper';

type Props = {
  loading: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// In Bring's colours, for those who shop with Bring.
export const BringImportButton = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <Button
      contentStyle={{height: 42}}
      style={[{width: 400, height: 42}, props.style]}
      icon={() => <Avatar.Image size={24} source={require('../../assets/Bring_Logo_big.png')}/>}
      buttonColor="#324047"
      mode="elevated"
      loading={props.loading}
      disabled={props.loading}
      onPress={props.onPress}>{t('common.bringimport')}</Button>
  );
};
