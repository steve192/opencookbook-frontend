import {TFunction} from 'i18next';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {SeasonalFood} from '../../../api/types/catalogue';
import {ShoppingIcon} from '../../../components/shopping/ShoppingIcon';
import {useAppTheme} from '../../../styles/CentralStyles';
import {GROWING_METHODS, MONTHS, monthsBy} from '../../../tools/seasonal/seasonal';
import {MonthCells, Swatch, useMonthName, useMonthsText} from './SeasonTable';

// How to keep a food at home, as sentences.
const storageTips = (food: SeasonalFood, t: TFunction): string[] => {
  const storage = food.storage;
  if (!storage) {
    return [];
  }
  return [
    storage.place === 'FRIDGE' ? t('tools.seasonalCalendar.storage.fridge') : undefined,
    storage.place === 'COOL_DARK' ? t('tools.seasonalCalendar.storage.coolDark') : undefined,
    storage.coldSensitive ? t('tools.seasonalCalendar.storage.coldSensitive') : undefined,
    storage.ethyleneProducer ? t('tools.seasonalCalendar.storage.ethyleneProducer') : undefined,
    storage.ethyleneSensitive ? t('tools.seasonalCalendar.storage.ethyleneSensitive') : undefined,
  ].filter((tip): tip is string => tip != null);
};

interface Props {
  food?: SeasonalFood;
  month: number;
  onDismiss: () => void;
}

// A food's whole year in words, and how to keep it.
export const FoodDetails = ({food, month, onDismiss}: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const monthName = useMonthName();
  const monthsText = useMonthsText();
  const tips = food ? storageTips(food, t) : [];
  return (
    <Portal>
      <Dialog visible={food != null} onDismiss={onDismiss} style={styles.dialog}>
        {food && <>
          <Dialog.Title>{food.displayName}</Dialog.Title>
          <Dialog.Content style={styles.content}>
            <View style={styles.summary}>
              <ShoppingIcon icon={food.icon} aisle="FRUIT_VEG" size={48} />
              <Text variant="bodyLarge" style={styles.summaryText}>
                {food.inSeason.length > 0 ?
                  t('tools.seasonalCalendar.inSeasonMonths', {months: monthsText(food.inSeason, 'long')}) :
                  t('tools.seasonalCalendar.noOutdoorSeason')}
              </Text>
            </View>
            <View style={styles.year}>
              <MonthCells food={food} month={month} height={24} />
              <View style={styles.letters}>
                {MONTHS.map((letterMonth) => (
                  <Text key={letterMonth} variant="labelSmall" style={styles.letter}>{monthName(letterMonth, 'narrow')}</Text>
                ))}
              </View>
            </View>
            {GROWING_METHODS.filter((method) => monthsBy(food, method).length > 0).map((method) => (
              <View key={method} style={styles.method}>
                <Swatch method={method} />
                <Text variant="bodyMedium" style={styles.methodText}>
                  {t(`tools.seasonalCalendar.methods.${method}`)}: {monthsText(monthsBy(food, method))}
                </Text>
              </View>
            ))}
            {tips.length > 0 && <View style={styles.tips}>
              <Text variant="titleSmall">{t('tools.seasonalCalendar.storageTitle')}</Text>
              {tips.map((tip) => <Text key={tip} variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                {tip}</Text>)}
            </View>}
          </Dialog.Content>
          <Dialog.Actions><Button onPress={onDismiss}>{t('common.close')}</Button></Dialog.Actions>
        </>}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {maxWidth: 520, width: '92%', alignSelf: 'center'},
  content: {gap: 10},
  summary: {flexDirection: 'row', alignItems: 'center', gap: 12},
  summaryText: {flex: 1},
  year: {gap: 2},
  letters: {flexDirection: 'row', gap: 2},
  letter: {flex: 1, textAlign: 'center'},
  method: {flexDirection: 'row', alignItems: 'center', gap: 8},
  methodText: {flex: 1},
  tips: {gap: 4, marginTop: 4},
});
