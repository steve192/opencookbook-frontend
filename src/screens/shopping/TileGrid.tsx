import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Aisle} from '../../dao/aisles';
import {AisleSections} from './AisleSections';

interface Props<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderTile: (item: T) => React.ReactNode;
  /** Headed by aisle, in the order a shop is walked; otherwise one plain grid. */
  byAisle?: boolean;
}

// Tiles wrapped into rows, optionally under an aisle heading each.
export const TileGrid = <T extends {aisle: Aisle}>(props: Props<T>) => {
  const grid = (items: T[]) => (
    <View style={styles.grid}>
      {items.map((item) => <React.Fragment key={props.keyOf(item)}>{props.renderTile(item)}</React.Fragment>)}
    </View>
  );
  return props.byAisle ? <AisleSections items={props.items} renderItems={grid} /> : grid(props.items);
};

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
});
