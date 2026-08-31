import React from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, StyleSheet, View} from 'react-native';
import {Icon, IconButton, Text} from 'react-native-paper';
import {RecipeImageComponent} from '../../components/RecipeImageComponent';
import {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  title: string;
  /** Undefined for spontaneous meals, which have no recipe behind them */
  imageUuid?: string;
  onPress?: () => void;
  onRemovePress: () => void;
  /** Omitted for the first meal of a day, which cannot move further up */
  onMoveUpPress?: () => void;
  /** Omitted for the last meal of a day */
  onMoveDownPress?: () => void;
  /** Reordering is pointless while a day holds a single meal */
  reorderable: boolean;
}

interface ReorderButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

// One planned meal, as a full width row. The previous design put meals in 120px
// wide cards inside a horizontal scroller and hid the delete button behind a long
// press, so neither the full title nor the way to remove an entry was visible.
export const WeekplanMealRow = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  // A pair of these replaces a drag handle: dragging needs a gesture library and
  // a scroll container that yields to it, while two arrows work with a keyboard,
  // a screen reader and a mouse alike.
  const renderReorderButton = (buttonProps: ReorderButtonProps) => (
    <Pressable
      disabled={!buttonProps.onPress}
      accessibilityRole="button"
      accessibilityLabel={buttonProps.label}
      style={styles.reorderButton}
      onPress={buttonProps.onPress}>
      <Icon
        source={buttonProps.icon}
        size={18}
        color={buttonProps.onPress ? theme.colors.onSurfaceVariant : theme.colors.onSurfaceDisabled} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.main}
        disabled={!props.onPress}
        onPress={props.onPress}>
        <View style={[styles.thumbnail, {backgroundColor: theme.colors.surfaceVariant}]}>
          {props.imageUuid ?
            <RecipeImageComponent
              useThumbnail={true}
              forceFitScaling={true}
              uuid={props.imageUuid} /> :
            <View style={styles.thumbnailPlaceholder}>
              <Icon source="silverware-fork-knife" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
          }
        </View>
        <Text numberOfLines={2} style={styles.title}>{props.title}</Text>
        {props.onPress &&
          <Icon source="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
        }
      </Pressable>
      {props.reorderable &&
        <View style={styles.reorderColumn}>
          {renderReorderButton({
            icon: 'chevron-up',
            label: t('screens.weekplan.moveMealUp'),
            onPress: props.onMoveUpPress,
          })}
          {renderReorderButton({
            icon: 'chevron-down',
            label: t('screens.weekplan.moveMealDown'),
            onPress: props.onMoveDownPress,
          })}
        </View>
      }
      <IconButton
        icon="close"
        size={18}
        iconColor={theme.colors.onSurfaceVariant}
        accessibilityLabel={t('screens.weekplan.removeMeal')}
        onPress={props.onRemovePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  reorderColumn: {
    justifyContent: 'center',
  },
  reorderButton: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
