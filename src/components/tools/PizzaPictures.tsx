import React from 'react';
import {StyleSheet, View} from 'react-native';

const CRUST = '#E3B672';
const CRUST_EDGE = '#B98741';
const SAUCE = '#D35B3E';
const DOUGH = '#F3E3C4';
const DOUGH_EDGE = '#CDAF7F';
const LARGEST_PX = 64;

// A pizza drawn to scale against the largest one shown, with its diameter marked.
export const PizzaSizePicture = (props: {diameterCm: number, largestCm: number}) => {
  const size = LARGEST_PX * props.diameterCm / props.largestCm;
  return (
    <View accessible={false} style={[styles.pizza, {width: size, height: size, borderRadius: size / 2}]}>
      <View style={{width: size * 0.78, height: size * 0.78, borderRadius: size * 0.39, backgroundColor: SAUCE}} />
      <View style={styles.diameter} />
      <View style={[styles.tick, styles.left]} />
      <View style={[styles.tick, styles.right]} />
    </View>
  );
};

// A dough ball drawn to scale against the heaviest one shown: its size grows with the cube root of its weight.
export const DoughBallPicture = (props: {grams: number, heaviestGrams: number}) => {
  const size = LARGEST_PX * Math.cbrt(props.grams / props.heaviestGrams);
  return (
    <View accessible={false} style={[styles.ball, {width: size, height: size * 0.8, borderRadius: size / 2}]}>
      <View style={[styles.shine, {top: size * 0.12, left: size * 0.2, width: size * 0.3, height: size * 0.14,
        borderRadius: size * 0.07}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  pizza: {backgroundColor: CRUST, borderWidth: 1, borderColor: CRUST_EDGE, alignItems: 'center',
    justifyContent: 'center'},
  diameter: {position: 'absolute', left: 1, right: 1, top: '50%', height: 2, marginTop: -1, backgroundColor: '#FFFFFF'},
  tick: {position: 'absolute', top: '50%', width: 2, height: 10, marginTop: -5, backgroundColor: '#FFFFFF'},
  left: {left: 1},
  right: {right: 1},
  ball: {backgroundColor: DOUGH, borderWidth: 1, borderColor: DOUGH_EDGE},
  shine: {position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.7)'},
});
