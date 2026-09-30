import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Icon, Text, TouchableRipple} from 'react-native-paper';
import XDate from 'xdate';
import {formatDayAndMonth} from '../helper/weekplan';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {useAppTheme} from '../styles/CentralStyles';
import {probeRequested} from './connectivitySlice';

// Older than this, the data is said to be possibly outdated.
const OUTDATED_AFTER_MILLIS = 7 * 24 * 60 * 60 * 1000;

/**
 * A slim line saying the app is offline and how old what it shows is. Tapping asks the server again.
 *
 * @return {JSX.Element | null} the banner, nothing while online
 */
export const OfflineBanner = () => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const {online, reason, lastSyncedAt} = useAppSelector((state) => state.connectivity);

  if (online) {
    return null;
  }
  const state = reason === 'unreachable' ? t('offline.unreachable') : t('offline.noNetwork');
  let age = '';
  if (lastSyncedAt !== null) {
    const synced = new XDate(lastSyncedAt);
    age = Date.now() - lastSyncedAt > OUTDATED_AFTER_MILLIS ?
      t('offline.outdated', {date: formatDayAndMonth(synced, i18n.language)}) :
      t('offline.since', {time: synced.toString('HH:mm')});
  }
  return (
    <TouchableRipple onPress={() => dispatch(probeRequested())} accessibilityRole="button"
      style={{backgroundColor: theme.colors.surfaceVariant}}>
      <View style={styles.row}>
        <Icon source="cloud-off-outline" size={16} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
          {age ? `${state} · ${age}` : state}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4},
});
