import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';
import {Aisle} from '../../dao/aisles';
import {useAppTheme} from '../../styles/CentralStyles';
import {ShoppingIcon} from './ShoppingIcon';

interface Props {
  name: string;
  spec?: string | null;
  icon: string | null;
  aisle: Aisle;
  /** Bought, or offered for adding: shown quieter than what is still to buy. */
  muted?: boolean;
  /** Already on the list, while adding. */
  highlighted?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TILE_SIZE = 96;

// One thing on a list, or to add to one: tapped to tick off or add, long pressed for details.
export const ShoppingItemTile = (props: Props) => {
  const theme = useAppTheme();
  const background = props.highlighted ? theme.colors.primaryContainer :
    props.muted ? theme.colors.surfaceVariant : theme.colors.secondaryContainer;
  return (
    <TouchableRipple
      style={[styles.tile, {backgroundColor: background, opacity: props.muted ? 0.7 : 1}]}
      borderless
      accessibilityRole="button"
      accessibilityLabel={props.spec ? `${props.name}, ${props.spec}` : props.name}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>
      <View style={styles.content}>
        <ShoppingIcon icon={props.icon} aisle={props.aisle} size={36} />
        <Text variant="labelLarge" numberOfLines={2} style={styles.name}>{props.name}</Text>
        {!!props.spec &&
          <Text variant="labelSmall" numberOfLines={1} style={{color: theme.colors.onSurfaceVariant}}>{props.spec}</Text>}
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  tile: {width: TILE_SIZE, minHeight: TILE_SIZE, borderRadius: 12},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 2},
  name: {textAlign: 'center'},
});
