import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Avatar, Button, Card} from 'react-native-paper';
import XDate from 'xdate';
import {formatDayAndMonth} from '../helper/weekplan';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {storageUsage} from './storage';
import {syncForOffline} from './sync';
import {useIsOnline} from './useIsOnline';

const BYTES_PER_MEGABYTE = 1024 * 1024;

const cloudAvatar = ({size}: {size: number}) => <Avatar.Icon size={size} icon="cloud-sync-outline" />;

// When the data for offline use was last brought up to date, and a way to do it now.
export const OfflineDataCard = () => {
  const {t, i18n} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const online = useIsOnline();
  const lastSyncedAt = useAppSelector((state) => state.connectivity.lastSyncedAt);
  const [syncing, setSyncing] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);

  useEffect(() => {
    storageUsage().then(setUsage).catch(() => setUsage(null));
  }, [lastSyncedAt]);

  const syncNow = () => {
    setSyncing(true);
    void dispatch(syncForOffline()).finally(() => setSyncing(false));
  };

  const synced = lastSyncedAt === null ? null : new XDate(lastSyncedAt);
  const lines = [
    synced ?
      t('offline.lastSynced', {time: `${formatDayAndMonth(synced, i18n.language)} ${synced.toString('HH:mm')}`}) :
      t('offline.neverSynced'),
    ...(usage === null ? [] : [t('offline.storageUsed', {size: (usage / BYTES_PER_MEGABYTE).toFixed(1)})]),
  ];

  return (
    <Card>
      <Card.Title title={t('offline.settingsTitle')} subtitle={lines.join('\n')} subtitleNumberOfLines={2}
        left={cloudAvatar} />
      <Card.Actions>
        <Button icon="sync" disabled={!online || syncing} loading={syncing} onPress={syncNow}>
          {syncing ? t('offline.syncing') : t('offline.syncNow')}
        </Button>
      </Card.Actions>
    </Card>
  );
};
