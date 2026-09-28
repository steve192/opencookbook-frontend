import React from 'react';
import {StyleSheet} from 'react-native';
import {ActivityIndicator, Surface} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';

// A whole screen waiting for what it shows.
export const LoadingScreen = () => (
  <Surface style={[CentralStyles.fullscreen, styles.centered]}><ActivityIndicator /></Surface>
);

const styles = StyleSheet.create({
  centered: {justifyContent: 'center'},
});
