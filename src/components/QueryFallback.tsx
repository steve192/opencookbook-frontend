import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, Icon, Surface, Text} from 'react-native-paper';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {useIsOnline} from '../offline/useIsOnline';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {LoadingScreen} from './LoadingScreen';

interface Props {
  /** What reading failed with, if it did. */
  error?: unknown;
  onRetry: () => void;
}

/**
 * What a screen shows while it has nothing cached: loading, offline without the data, or the failure.
 *
 * @param {Props} props what reading the data ended with so far
 * @return {JSX.Element} the placeholder
 */
export const QueryFallback = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();

  if (online && !props.error) {
    return <LoadingScreen />;
  }
  return (
    <Surface style={[CentralStyles.screen, styles.centered]}>
      <Icon source={online ? 'alert-circle-outline' : 'cloud-off-outline'} size={40}
        color={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={styles.text}>
        {online ? t(errorMessageKey(props.error)) : t('offline.notCached')}
      </Text>
      {online ?
        <Button onPress={props.onRetry}>{t('common.retry')}</Button> :
        <Text variant="bodyMedium" style={styles.text}>{t('offline.notCachedHint')}</Text>}
    </Surface>
  );
};

const styles = StyleSheet.create({
  centered: {justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24},
  text: {textAlign: 'center'},
});
