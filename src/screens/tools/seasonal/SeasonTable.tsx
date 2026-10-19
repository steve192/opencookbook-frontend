import React from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, StyleSheet, View} from 'react-native';
import {IconButton, Text, TouchableRipple} from 'react-native-paper';
import {GrowingMethod, SeasonalFood} from '../../../api/types/catalogue';
import {ShoppingIcon} from '../../../components/shopping/ShoppingIcon';
import {useAppTheme} from '../../../styles/CentralStyles';
import {endsThisMonth, GROWING_METHODS, monthRuns, MONTHS, nextMonth, previousMonth,
  strongestMethod} from '../../../tools/seasonal/seasonal';

export const useMethodColours = (): Record<GrowingMethod, string> => {
  const {colors} = useAppTheme();
  return {
    FIELD: colors.primary,
    PROTECTED: colors.primaryContainer,
    UNHEATED_GREENHOUSE: colors.tertiaryContainer,
    HEATED_GREENHOUSE: colors.errorContainer,
    STORED: colors.surfaceVariant,
  };
};

export const useMonthName = () => {
  const {i18n} = useTranslation('translation');
  return (month: number, width: 'long' | 'short' | 'narrow') =>
    new Date(2000, month - 1, 1).toLocaleString(i18n.language, {month: width});
};

/**
 * Months as runs in words, such as "Jun to Oct, Dec".
 *
 * @return {Function} months to text
 */
export const useMonthsText = () => {
  const {t} = useTranslation('translation');
  const monthName = useMonthName();
  return (months: number[], width: 'long' | 'short' = 'short') => monthRuns(months).map((run) => run.length === 1 ?
    monthName(run[0], width) : t('tools.range', {low: monthName(run[0], width), high: monthName(run.at(-1)!, width)}))
      .join(', ');
};

export const Swatch = ({method}: {method?: GrowingMethod}) => {
  const theme = useAppTheme();
  const colours = useMethodColours();
  return <View style={[styles.swatch, {backgroundColor: method ? colours[method] : theme.colors.surface,
    borderColor: theme.colors.outlineVariant}]} />;
};

// What each colour means.
export const SeasonLegend = () => {
  const {t} = useTranslation('translation');
  return (
    <View style={styles.legend}>
      {GROWING_METHODS.map((method) => (
        <View key={method} style={styles.legendEntry}>
          <Swatch method={method} />
          <Text variant="labelSmall">{t(`tools.seasonalCalendar.methods.${method}`)}</Text>
        </View>
      ))}
    </View>
  );
};

interface CellsProps {
  food: SeasonalFood;
  /** Outlined, as the month being looked at. */
  month: number;
  height: number;
}

// A food's year at a glance: one cell per month, coloured by how it comes to market.
export const MonthCells = ({food, month, height}: CellsProps) => {
  const theme = useAppTheme();
  const colours = useMethodColours();
  return (
    <View style={styles.cells}>
      {MONTHS.map((cellMonth) => {
        const method = strongestMethod(food, cellMonth);
        const chosen = cellMonth === month;
        return (
          <View key={cellMonth} style={[styles.cell, {height,
            backgroundColor: method ? colours[method] : theme.colors.surface,
            borderColor: chosen ? theme.colors.onSurface : theme.colors.outlineVariant,
            borderWidth: chosen ? 2 : StyleSheet.hairlineWidth}]} />
        );
      })}
    </View>
  );
};

interface HeaderProps {
  month: number;
  onMonth: (month: number) => void;
}

// Stays on top while the foods scroll by: the legend, and the months, which also choose the month.
export const SeasonTableHeader = ({month, onMonth}: HeaderProps) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const monthName = useMonthName();
  return (
    <View style={[styles.header, {backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outlineVariant}]}>
      <SeasonLegend />
      <View style={styles.row}>
        <View style={[styles.nameColumn, styles.stepper]}>
          <IconButton icon="chevron-left" size={20} style={styles.stepButton}
            accessibilityLabel={t('tools.seasonalCalendar.previousMonth')} onPress={() => onMonth(previousMonth(month))} />
          <Text variant="titleSmall" numberOfLines={1} style={styles.monthName}>{monthName(month, 'long')}</Text>
          <IconButton icon="chevron-right" size={20} style={styles.stepButton}
            accessibilityLabel={t('tools.seasonalCalendar.nextMonth')} onPress={() => onMonth(nextMonth(month))} />
        </View>
        <View style={styles.cells}>
          {MONTHS.map((letterMonth) => {
            const chosen = letterMonth === month;
            return (
              <Pressable key={letterMonth} style={styles.letterCell} hitSlop={{top: 8, bottom: 8}}
                accessibilityRole="button" accessibilityState={{selected: chosen}}
                accessibilityLabel={monthName(letterMonth, 'long')} onPress={() => onMonth(letterMonth)}>
                <View style={[styles.letter, chosen && {backgroundColor: theme.colors.primary}]}>
                  <Text variant="labelSmall" style={{color: chosen ? theme.colors.onPrimary : theme.colors.onSurface}}>
                    {monthName(letterMonth, 'narrow')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

interface RowProps {
  food: SeasonalFood;
  month: number;
  onOpen: () => void;
}

// One food: its name and outdoor season on the left, its year on the right.
export const SeasonRow = ({food, month, onOpen}: RowProps) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const monthsText = useMonthsText();
  const season = food.inSeason.length > 0 ? monthsText(food.inSeason) : t('tools.seasonalCalendar.noOutdoorSeason');
  return (
    <TouchableRipple onPress={onOpen} accessibilityRole="button"
      accessibilityLabel={`${food.displayName}, ${season}`}
      style={[styles.foodRow, {borderColor: theme.colors.outlineVariant}]}>
      <View style={styles.row}>
        <View style={[styles.nameColumn, styles.food]}>
          <ShoppingIcon icon={food.icon} aisle="FRUIT_VEG" size={28} />
          <View style={styles.foodText}>
            <Text variant="bodyMedium" numberOfLines={2}>{food.displayName}</Text>
            {/* The cells show the season; the last month of it is worth saying. */}
            {endsThisMonth(food, month) ?
              <Text variant="labelMedium" numberOfLines={1} style={{color: theme.colors.primary}}>
                {t('tools.seasonalCalendar.lastMonth')}</Text> :
              <Text variant="bodySmall" numberOfLines={1} style={{color: theme.colors.onSurfaceVariant}}>{season}</Text>}
          </View>
        </View>
        <MonthCells food={food} month={month} height={18} />
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  header: {gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth},
  legend: {flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4},
  legendEntry: {flexDirection: 'row', alignItems: 'center', gap: 4},
  swatch: {width: 12, height: 12, borderRadius: 3, borderWidth: StyleSheet.hairlineWidth},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  nameColumn: {flex: 5, minWidth: 0},
  stepper: {flexDirection: 'row', alignItems: 'center'},
  stepButton: {margin: 0},
  monthName: {flexShrink: 1, textAlign: 'center', flexGrow: 1},
  cells: {flex: 8, flexDirection: 'row', gap: 2},
  cell: {flex: 1, borderRadius: 4},
  letterCell: {flex: 1, alignItems: 'center'},
  letter: {minWidth: 18, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 2},
  foodRow: {paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth},
  food: {flexDirection: 'row', alignItems: 'center', gap: 8},
  foodText: {flex: 1},
});
