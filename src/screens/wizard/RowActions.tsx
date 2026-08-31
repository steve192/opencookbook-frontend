import React from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-paper';
import {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  canMoveUp: boolean;
  canMoveDown: boolean;
  removeLabel: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

// Reorder and remove for one row of the editor, stacked into a narrow trailing column so
// three controls cost about as much width as one. Arrows rather than dragging: they need no
// gesture library and they work with a keyboard and a screen reader.
export const RowActions = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  const renderAction = (icon: string, label: string, onPress: () => void, enabled: boolean, color?: string) => (
    <Pressable
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.action}
      onPress={onPress}>
      <Icon source={icon} size={22} color={enabled ? (color ?? theme.colors.onSurfaceVariant) : theme.colors.onSurfaceDisabled} />
    </Pressable>
  );

  return (
    <View style={styles.column}>
      {renderAction('chevron-up', t('screens.editRecipe.moveUp'), props.onMoveUp, props.canMoveUp)}
      {renderAction('chevron-down', t('screens.editRecipe.moveDown'), props.onMoveDown, props.canMoveDown)}
      {renderAction('close', props.removeLabel, props.onRemove, true, theme.colors.error)}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    justifyContent: 'center',
  },
  // 44 square: the Android guideline for a touch target is 48dp and Apple's is 44pt, and
  // three stacked 34x28 targets were small enough to mis-hit.
  action: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
});
