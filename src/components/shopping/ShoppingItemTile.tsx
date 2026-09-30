import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text, TouchableRipple} from 'react-native-paper';
import {Aisle} from '../../api/aisles';
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
  /** Picked, as for moving. */
  selected?: boolean;
  prioritized?: boolean;
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
  if (props.highlighted || props.selected) {
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
        accessibilityState={{selected: props.selected}}
        onPress={props.onPress}
        onLongPress={props.onLongPress}>
        <View style={styles.content}>
          <ShoppingIcon icon={props.icon} aisle={props.aisle} size={36} />
          <Text variant="labelLarge" numberOfLines={2} style={styles.name}>{props.name}</Text>
          {!!props.spec &&
            <Text variant="labelSmall" numberOfLines={1} style={{color: theme.colors.onSurfaceVariant}}>
              {props.spec}
            </Text>}
          {props.selected &&
            <View style={[styles.badge, styles.start]}>
              <Icon source="check-circle" size={BADGE_SIZE} color={theme.colors.primary} />
            </View>}
          {props.prioritized &&
            <View style={[styles.badge, styles.end]}>
              <Icon source={PRIORITY_ICON} size={BADGE_SIZE} color={theme.colors.error} />
            </View>}
        </View>
      </TouchableRipple>
    </View>
  );
};

export const PRIORITY_ICON = 'fire';
const BADGE_SIZE = 18;

const styles = StyleSheet.create({
  tile: {minHeight: 96, borderRadius: 12},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 2},
  name: {textAlign: 'center'},
  hidden: {opacity: 0},
  badge: {position: 'absolute', top: 4},
  start: {left: 4},
  end: {right: 4},
});
