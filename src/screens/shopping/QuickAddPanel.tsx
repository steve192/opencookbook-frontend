import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {Aisle} from '../../api/aisles';
import {ShoppingItem, ShoppingTile} from '../../api/types/shopping';
import {nameKey} from '../../helper/shopping/names';
import {TILE_AREA_PADDING} from '../../helper/shopping/tileLayout';
import {TYPED_TILE_KEY} from '../../helper/shopping/tileKeys';
import {searchTiles, tileName, typedEntry} from '../../helper/shopping/tiles';
import {TileGrid} from './TileGrid';
import {VirtualTileGrid} from './VirtualTileGrid';

// A tile to add from: a known tile, or what is typed, which the server places.
interface Offer {
  key: string;
  name: string;
  aisle: Aisle;
  icon: string | null;
  tile?: ShoppingTile;
}

const offerOf = (tile: ShoppingTile, language: string): Offer =>
  ({key: tile.key, name: tileName(tile, language), aisle: tile.aisle, icon: tile.icon, tile});
const offerKey = (offer: Offer) => offer.key;
const itemKey = (item: ShoppingItem) => item.id;

interface Props {
  typed: string;
  tiles: ShoppingTile[];
  unitWords: ReadonlySet<string>;
  active: ShoppingItem[];
  bought: ShoppingItem[];
  /** @param sourceKey the tapped tile's, as registered */
  onAdd: (name: string, spec: string | null, tile: ShoppingTile | undefined, sourceKey: string) => void;
  onRestore: (item: ShoppingItem, sourceKey: string) => void;
  registerSource: (key: string) => (view: View | null) => void;
}

// With nothing typed, every tile by aisle; while typing, fitting recent purchases, the typed tile, fitting tiles.
export const QuickAddPanel = (props: Props) => {
  const {i18n} = useTranslation('translation');
  const language = i18n.language;
  const entry = useMemo(() => typedEntry(props.typed, props.unitWords, props.tiles, props.bought),
      [props.typed, props.unitWords, props.tiles, props.bought]);
  const onList = useMemo(() => new Set(props.active.map((item) => nameKey(item.name))), [props.active]);
  const allOffers = useMemo(() => props.tiles.map((tile) => offerOf(tile, language)), [props.tiles, language]);

  const renderOffer = (offer: Offer) => (
    <ShoppingItemTile
      name={offer.name}
      spec={offer.tile ? undefined : entry?.spec}
      icon={offer.icon}
      aisle={offer.aisle}
      highlighted={onList.has(nameKey(offer.name))}
      viewRef={props.registerSource(offer.key)}
      onPress={() => props.onAdd(offer.name, entry?.spec ?? null, offer.tile, offer.key)} />
  );

  if (!entry) {
    return <VirtualTileGrid items={allOffers} keyOf={offerKey} renderTile={renderOffer} />;
  }

  const key = nameKey(entry.name);
  const recent = props.bought.filter((item) => nameKey(item.name).includes(key)).slice(0, 8);
  const typedOffer: Offer[] = entry.tile || entry.recent ?
    [] : [{key: TYPED_TILE_KEY, name: entry.name, aisle: 'OTHER', icon: null}];
  const fitting = searchTiles(props.tiles, entry.name, language).map((tile) => offerOf(tile, language));
  return (
    <ScrollView contentContainerStyle={styles.panel} keyboardShouldPersistTaps="always">
      {recent.length > 0 &&
        <TileGrid items={recent} keyOf={itemKey} renderTile={(item) => (
          <ShoppingItemTile name={item.name} icon={item.icon} aisle={item.aisle} muted
            viewRef={props.registerSource(item.id)}
            onPress={() => props.onRestore(item, item.id)} />
        )} />}
      <TileGrid items={[...typedOffer, ...fitting]} keyOf={offerKey} renderTile={renderOffer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Stretched, since the grids fit their columns to the width they get.
  panel: {gap: 12, padding: TILE_AREA_PADDING},
});
