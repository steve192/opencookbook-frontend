import React from 'react';
import {DimensionValue, Platform, StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition, ZoomIn, ZoomOut} from 'react-native-reanimated';
import {Aisle} from '../../api/aisles';
import {headingKey, tileCells} from '../../helper/shopping/aisles';
import {TILE_GAP, tileWidthFor} from '../../helper/shopping/tileLayout';
import {useLayoutWidth} from '../../helper/useLayoutWidth';
import {AisleHeading} from './AisleHeading';
import {useWebFlip} from './useWebFlip';

interface Props<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderTile: (item: T) => React.ReactNode;
  /** Headed by aisle, in shop order; otherwise in the order given. */
  byAisle?: boolean;
  /** Tiles coming and going animate, the rest slide into place, also when byAisle changes. */
  animated?: boolean;
  /** Placed and removed without animating, as a copy flies to or from it. */
  still?: (item: T) => boolean;
}

type CellAnimations = Pick<React.ComponentProps<typeof Animated.View>, 'entering' | 'exiting' | 'layout'>;

export const TILE_LAYOUT = LinearTransition.duration(250);
// On the web, moves are animated by useWebFlip instead.
const CELL_LAYOUT = Platform.OS === 'web' ? undefined : TILE_LAYOUT;
const TILE_ANIMATIONS: CellAnimations = {entering: ZoomIn.duration(250), exiting: ZoomOut.duration(200), layout: CELL_LAYOUT};
const STILL_ANIMATIONS: CellAnimations = {};
const HEADING_ANIMATIONS: CellAnimations = {entering: FadeIn, exiting: FadeOut, layout: CELL_LAYOUT};

// Rows filling the width. Headings are cells of the same grid, so a tile keeps its view when the order changes.
export const TileGrid = <T extends {aisle: Aisle}>(props: Props<T>) => {
  const {width, onLayout} = useLayoutWidth();
  const still = new Set(props.items.filter((item) => props.still?.(item)).map(props.keyOf));
  const flipRef = useWebFlip(!!props.animated, still);

  const cell = (key: string, cellWidth: DimensionValue, animations: CellAnimations, content: React.ReactNode) =>
    props.animated ?
      <Animated.View key={key} style={{width: cellWidth}} {...animations}>
        <View ref={flipRef(key)} collapsable={false}>{content}</View>
      </Animated.View> :
      <View key={key} style={{width: cellWidth}}>{content}</View>;

  const tileCell = (item: T, tileWidth: number) => {
    const key = props.keyOf(item);
    return cell(key, tileWidth, still.has(key) ? STILL_ANIMATIONS : TILE_ANIMATIONS, props.renderTile(item));
  };

  const grid = (tileWidth: number) => (
    <View style={styles.grid}>
      {tileCells(props.items, !!props.byAisle).map((each) => 'heading' in each ?
        cell(headingKey(each.heading), '100%', HEADING_ANIMATIONS,
            <AisleHeading aisle={each.heading} inGrid />) :
        tileCell(each.item, tileWidth))}
    </View>
  );

  // Rendered once the width is known, without entering animations for what is there then.
  return (
    <View onLayout={onLayout}>
      {width !== undefined &&
        <LayoutAnimationConfig skipEntering>{grid(tileWidthFor(width))}</LayoutAnimationConfig>}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP},
});
