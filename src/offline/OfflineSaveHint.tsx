import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {useIsOnline} from './useIsOnline';

export const OfflineSaveHint = () => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  return online ? null : <Text variant="bodySmall">{t('offline.cannotSave')}</Text>;
};
