import React from 'react';
import {StyleSheet} from 'react-native';
import {ActivityIndicator, Surface} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';

export const LoadingScreen = () => (
  <Surface style={[CentralStyles.screen, styles.centered]}><ActivityIndicator /></Surface>
);

const styles = StyleSheet.create({
  centered: {justifyContent: 'center'},
});
