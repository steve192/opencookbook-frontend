import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {Aisle} from '../../api/aisles';

interface Props {
  aisle: Aisle;
  /** A row of a tile grid, spaced by the grid's gap. */
  inGrid?: boolean;
  style?: StyleProp<TextStyle>;
}

export const AisleHeading = ({aisle, inGrid, style}: Props) => {
  const {t} = useTranslation('translation');
  return <Text variant="labelLarge" style={[inGrid && styles.inGrid, style]}>{t(`aisles.${aisle}`)}</Text>;
};

const styles = StyleSheet.create({
  // With the grid's gap: 12 above a heading, 8 below.
  inGrid: {paddingTop: 4},
});
