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
  onPress?: () => void;
  onLongPress?: () => void;
  /** For measuring the tile's position. */
  viewRef?: React.Ref<View>;
  /** Keeps its place while a copy flies there. */
  hidden?: boolean;
}

// Tapped to tick off or add, long pressed for details; as wide as its grid cell.
export const ShoppingItemTile = (props: Props) => {
  const theme = useAppTheme();
  let background = theme.colors.secondaryContainer;
  if (props.highlighted) {
    background = theme.colors.primaryContainer;
  } else if (props.muted) {
    background = theme.colors.surfaceVariant;
  }
  return (
    <View ref={props.viewRef} collapsable={false} style={props.hidden ? styles.hidden : undefined}>
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
            <Text variant="labelSmall" numberOfLines={1} style={{color: theme.colors.onSurfaceVariant}}>
              {props.spec}
            </Text>}
        </View>
      </TouchableRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {minHeight: 96, borderRadius: 12},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 2},
  name: {textAlign: 'center'},
  hidden: {opacity: 0},
});
