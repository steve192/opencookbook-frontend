import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import Animated from 'react-native-reanimated';
import {Aisle} from '../../api/aisles';
import {PageRect} from '../../helper/measureView';
import {ShoppingItemTile} from './ShoppingItemTile';

export interface TileLook {
  name: string;
  spec: string | null;
  icon: string | null;
  aisle: Aisle;
}

export interface Flight {
  id: string;
  sourceKey: string;
  /** The tile that waits, hidden, until the copy has landed. */
  targetKey: string;
  from: PageRect;
  /** Unknown until the item has its place. */
  to?: PageRect;
  tile: TileLook;
}

interface Props {
  flight: Flight;
  onLanded: (id: string) => void;
}

const DURATION_MILLIS = 350;

// A copy drawn over everything. A CSS transition moves it, which the browser and the UI thread run without
// waiting for JavaScript.
export const FlyingTile = ({flight, onLanded}: Props) => {
  const {from, to} = flight;
  const position = to ?? from;

  // Timed rather than on transitionend, which reanimated only reports on the web.
  useEffect(() => {
    if (!to) {
      return undefined;
    }
    const timer = setTimeout(() => onLanded(flight.id), DURATION_MILLIS);
    return () => clearTimeout(timer);
  }, [to, flight.id, onLanded]);

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.copy, {
          width: from.width,
          transform: [{translateX: position.x}, {translateY: position.y}],
          transitionProperty: 'transform',
          transitionDuration: DURATION_MILLIS,
          transitionTimingFunction: 'ease-in-out',
        }]}>
          <ShoppingItemTile {...flight.tile} />
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  copy: {position: 'absolute', left: 0, top: 0},
});
