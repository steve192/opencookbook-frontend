import React from 'react';
import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {useTheme, Text} from 'react-native-paper';


interface Props {
    value: string
    style?: StyleProp<ViewStyle>
    selected?: boolean
    onPress?: () => void
}
export const TextBullet = (props: Props) => {
  const theme = useTheme();

  const additionalStylesContainer = props.selected ?
        {backgroundColor: theme.colors.primary, borderColor: theme.colors.primary} :
        {borderColor: theme.colors.primary};

  const additionalStylesText = props.selected ? {color: theme.colors.onPrimary} : {color: theme.colors.primary};

  return (
    <Pressable
      style={[styles.textBulletContrainer, additionalStylesContainer, props.style]}
      onPress={props.onPress}>
      <Text style={[styles.textBullet, additionalStylesText]}>{props.value}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  textBulletContrainer: {
    borderWidth: 2,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textBullet: {
    fontWeight: 'bold',
  },
});

