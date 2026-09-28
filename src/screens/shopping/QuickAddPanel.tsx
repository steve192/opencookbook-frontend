import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Chip} from 'react-native-paper';
import {ShoppingItem, ShoppingTile} from '../../dao/RestAPI';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {nameKey} from '../../helper/shopping/names';
import {parseQuickAdd} from '../../helper/shopping/quickAdd';
import {searchTiles, tileName} from '../../helper/shopping/tiles';
import {TileGrid} from './TileGrid';

interface Props {
  typed: string;
  tiles: ShoppingTile[];
  unitWords: ReadonlySet<string>;
  active: ShoppingItem[];
  bought: ShoppingItem[];
  onAdd: (name: string, spec: string | null, tile?: ShoppingTile) => void;
  onAddTyped: () => void;
  onRestore: (item: ShoppingItem) => void;
}

// What adding offers: with nothing typed, every tile to browse by aisle; while typing, what was typed as it
// is, recently bought names that fit, then fitting tiles.
export const QuickAddPanel = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const language = i18n.language;
  const parsed = useMemo(() => parseQuickAdd(props.typed, props.unitWords), [props.typed, props.unitWords]);
  const onList = useMemo(() => new Set(props.active.map((item) => nameKey(item.name))), [props.active]);
  const addTile = (tile: ShoppingTile) => props.onAdd(tileName(tile, language), parsed.spec, tile);

  const tileOf = (tile: ShoppingTile) => (
    <ShoppingItemTile
      name={tileName(tile, language)}
      icon={tile.icon}
      aisle={tile.aisle}
      highlighted={onList.has(nameKey(tileName(tile, language)))}
      onPress={() => addTile(tile)} />
  );

  if (parsed.name.length === 0) {
    return <TileGrid byAisle items={props.tiles} keyOf={(tile) => tile.key} renderTile={tileOf} />;
  }

  const key = nameKey(parsed.name);
  const recent = props.bought.filter((item) => nameKey(item.name).includes(key)).slice(0, 8);
  return (
    <View style={styles.panel}>
      <Chip icon="plus" onPress={props.onAddTyped}>
        {t('screens.shopping.addTyped', {name: props.typed.trim()})}
      </Chip>
      {recent.length > 0 &&
        <TileGrid items={recent} keyOf={(item) => item.id} renderTile={(item) => (
          <ShoppingItemTile name={item.name} icon={item.icon} aisle={item.aisle} muted
            onPress={() => props.onRestore(item)} />
        )} />}
      <TileGrid items={searchTiles(props.tiles, parsed.name, language)} keyOf={(tile) => tile.key} renderTile={tileOf} />
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {gap: 12, alignItems: 'flex-start'},
});
