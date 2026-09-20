import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, IconButton, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {RecipeFactChips} from '../../components/RecipeFactChips';
import {RecipeRowCard} from '../../components/RecipeRowCard';
import {PlanSlot, RerollReason} from '../../dao/RestAPI';
import {mealTypeLabel} from '../../helper/mealTypes';
import {isUnfilled} from '../../helper/planDraft';
import {concerns, scoreReasonLabel} from '../../helper/scoreReasons';
import {formatShortWeekday} from '../../helper/weekplan';
import {useAppTheme} from '../../styles/CentralStyles';
import {RerollMenu} from './RerollMenu';

interface Props {
  slot: PlanSlot;
  /** For a leftover, the meal it is cooked at. */
  source?: PlanSlot;
  busy: boolean;
  onOpenRecipe: (recipeId: number) => void;
  onReroll: (reason?: RerollReason) => void;
  onLock: (locked: boolean) => void;
  onToggleGap: () => void;
}

// One meal of a proposed week, with what the cook can do about it.
export const PlanSlotRow = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const {slot} = props;
  const muted = {color: theme.colors.onSurfaceVariant};

  const actions = (
    <View style={styles.actions}>
      {slot.kind === 'COOKED' && !isUnfilled(slot) &&
        <IconButton
          icon={slot.locked ? 'lock' : 'lock-open-variant-outline'}
          selected={slot.locked}
          size={20}
          disabled={props.busy}
          accessibilityLabel={t(slot.locked ? 'screens.planning.unlock' : 'screens.planning.lock')}
          onPress={() => props.onLock(!slot.locked)} />
      }
      {slot.recipe ?
        <RerollMenu disabled={props.busy || slot.locked} onReroll={props.onReroll} /> :
        <IconButton
          icon="refresh"
          size={20}
          disabled={props.busy}
          accessibilityLabel={t('screens.planning.reroll')}
          onPress={() => props.onReroll()} />
      }
      <IconButton
        icon="calendar-remove-outline"
        size={20}
        disabled={props.busy || slot.locked}
        accessibilityLabel={t('screens.planning.leaveToMe')}
        onPress={props.onToggleGap} />
    </View>
  );

  const renderBody = () => {
    if (slot.kind === 'GAP') {
      return (
        <Surface style={styles.placeholder} elevation={0}>
          <Text variant="bodyMedium" style={[styles.placeholderText, muted]}>{t('screens.planning.gap')}</Text>
          <Button compact icon="silverware-fork-knife" disabled={props.busy} onPress={props.onToggleGap}>
            {t('screens.planning.planRecipe')}
          </Button>
        </Surface>
      );
    }
    if (slot.recipe === null) {
      return (
        <Surface style={styles.placeholder} elevation={0}>
          <Text variant="bodyMedium" style={[styles.placeholderText, {color: theme.colors.error}]}>
            {t('screens.planning.unfilled')}
          </Text>
          {actions}
        </Surface>
      );
    }
    return (
      <RecipeRowCard recipe={slot.recipe} onOpen={() => props.onOpenRecipe(slot.recipe!.id!)}>
        {slot.kind === 'LEFTOVER' && props.source ?
          <Text variant="bodySmall" style={muted}>
            {t('screens.planning.leftoverFrom', {day: formatShortWeekday(new XDate(props.source.date))})}
          </Text> :
          <RecipeFactChips recipe={slot.recipe} reasons={slot.reasons} servings={slot.servings} />
        }
        {/* The compromises the cookbook forced, said plainly rather than left to be discovered */}
        {concerns(slot.reasons).map((reason) => (
          <Text key={reason.term} variant="bodySmall" style={{color: theme.colors.error}}>
            {scoreReasonLabel(t, reason)}
          </Text>
        ))}
        {actions}
      </RecipeRowCard>
    );
  };

  return (
    <View style={styles.slot}>
      <Text variant="labelMedium" style={muted}>{mealTypeLabel(t, slot.mealType)}</Text>
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {gap: 4},
  actions: {flexDirection: 'row', marginLeft: -8},
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  placeholderText: {flex: 1},
});
