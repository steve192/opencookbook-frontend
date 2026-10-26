import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {ShoppingItem} from '../../api/types/shopping';
import {nameKey} from '../../helper/shopping/names';
import {TILE_AREA_PADDING} from '../../helper/shopping/tileLayout';
import {IndexedTile, KnownName, Offer, offersFor, tileOffer} from '../../helper/shopping/tiles';
import {TileGrid} from './TileGrid';
import {VirtualTileGrid} from './VirtualTileGrid';
import {AppScrollView} from '../../components/AppScrollView';

const offerKey = (offer: Offer) => offer.key;

interface Props {
  typed: string;
  tiles: IndexedTile[];
  unitWords: ReadonlySet<string>;
  /** What the list held before, most recent first. */
  earlier: KnownName[];
  active: ShoppingItem[];
  /** @param spec the amount typed with the name */
  onAdd: (offer: Offer, spec: string | null) => void;
  registerSource: (key: string) => (view: View | null) => void;
}

// With nothing typed, every tile by aisle; while typing, the typed name first, then earlier entries, then tiles.
// Memoised, so a keystroke renders it only once the deferred text catches up.
export const QuickAddPanel = React.memo(function QuickAddPanel(props: Props) {
  const offers = useMemo(() => offersFor(props.typed, props.unitWords, props.tiles, props.earlier),
      [props.typed, props.unitWords, props.tiles, props.earlier]);
  const onList = useMemo(() => new Set(props.active.map((item) => nameKey(item.name))), [props.active]);
  const browsing = useMemo(() => props.tiles.map(({tile, shown}) => tileOffer(tile, shown)), [props.tiles]);

  const renderOffer = (offer: Offer, muted = false) => (
    <ShoppingItemTile
      name={offer.name}
      spec={offer === offers?.typed ? offers.spec : undefined}
      icon={offer.icon}
      aisle={offer.aisle}
      muted={muted}
      highlighted={onList.has(nameKey(offer.name))}
      viewRef={props.registerSource(offer.key)}
      onPress={() => props.onAdd(offer, offers?.spec ?? null)} />
  );

  if (!offers) {
    return <VirtualTileGrid items={browsing} keyOf={offerKey} renderTile={(offer) => renderOffer(offer)} />;
  }
  return (
    <AppScrollView contentContainerStyle={styles.panel} keyboardShouldPersistTaps="always">
      <TileGrid items={[offers.typed, ...offers.earlier]} keyOf={offerKey}
        renderTile={(offer) => renderOffer(offer, offer !== offers.typed)} />
      {offers.fitting.length > 0 &&
        <TileGrid items={offers.fitting} keyOf={offerKey} renderTile={(offer) => renderOffer(offer)} />}
    </AppScrollView>
  );
});

const styles = StyleSheet.create({
  // Stretched, since the grids fit their columns to the width they get.
  panel: {gap: 12, padding: TILE_AREA_PADDING},
});
