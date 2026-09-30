import React from 'react';
import {View} from 'react-native';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {ShoppingItem} from '../../dao/RestAPI';

interface Props {
  item: ShoppingItem;
  /** Recently bought: quieter, and without the amount. */
  muted?: boolean;
  hidden: boolean;
  viewRef: (view: View | null) => void;
  onPress: (item: ShoppingItem) => void;
  onLongPress: (item: ShoppingItem) => void;
}

// Memoised, so typing or a flight re-renders only the tiles whose item changed; the callbacks must be stable.
export const ItemTile = React.memo(function ItemTile({item, muted, hidden, viewRef, onPress, onLongPress}: Props) {
  return (
    <ShoppingItemTile name={item.name} spec={muted ? null : item.spec} icon={item.icon} aisle={item.aisle}
      muted={muted} hidden={hidden} viewRef={viewRef}
      onPress={() => onPress(item)} onLongPress={() => onLongPress(item)} />
  );
});
