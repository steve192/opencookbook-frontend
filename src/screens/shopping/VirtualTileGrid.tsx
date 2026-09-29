import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Aisle} from '../../dao/aisles';
import {tileCells} from '../../helper/shopping/aisles';
import {columnsFor, TILE_AREA_PADDING, TILE_GAP, tileRows, tileWidthFor} from '../../helper/shopping/tileLayout';
import {useLayoutWidth} from '../../helper/useLayoutWidth';
import {AisleHeading} from './AisleHeading';

interface Props<T> {
  items: T[];
  /** Stable, or the rows are recomputed on every render. */
  keyOf: (item: T) => string;
  renderTile: (item: T) => React.ReactNode;
}

// Tiles by aisle in a list of their own that creates only the rows in view: hundreds at once are slow to mount.
export const VirtualTileGrid = <T extends {aisle: Aisle}>({items, keyOf, renderTile}: Props<T>) => {
  const {width, onLayout} = useLayoutWidth();
  const gridWidth = (width ?? 0) - 2 * TILE_AREA_PADDING;
  const rows = useMemo(() => width === undefined ? [] : tileRows(tileCells(items, true), columnsFor(gridWidth), keyOf),
      [items, width, gridWidth, keyOf]);
  const tileWidth = tileWidthFor(gridWidth);

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.key}
      // What a tile shows, e.g. whether it is on the list, changes without the rows changing.
      extraData={renderTile}
      onLayout={onLayout}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
      initialNumToRender={8}
      windowSize={5}
      renderItem={({item: row}) => 'heading' in row ?
        <AisleHeading aisle={row.heading} inGrid /> :
        <View style={styles.row}>
          {row.items.map((item) => <View key={keyOf(item)} style={{width: tileWidth}}>{renderTile(item)}</View>)}
        </View>} />
  );
};

const styles = StyleSheet.create({
  content: {padding: TILE_AREA_PADDING, gap: TILE_GAP},
  row: {flexDirection: 'row', gap: TILE_GAP},
});
