import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Icon, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsOnline} from '../offline/useIsOnline';
import {useAppTheme} from '../styles/CentralStyles';
import {PwaIosInstructionsDialog} from './PwaIosInstructionsDialog';
import {useInstallApp} from './useInstallApp';

// The banner inviting to install the web app; rendered only for signed in, set up accounts.
export const PwaInstallPrompt = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const online = useIsOnline();
  const {prompt, install, iosStepsShown, hideIosSteps} = useInstallApp();
  const steps = <PwaIosInstructionsDialog visible={iosStepsShown} onDismiss={hideIosSteps} />;

  // Not beside the offline banner: one thing at a time.
  if (!prompt.available || !online) {
    return steps;
  }
  return (
    <View pointerEvents="box-none" style={[styles.wrapper, {paddingBottom: Math.max(insets.bottom, 12)}]}>
      <Surface mode="elevated" elevation={4}
        style={[styles.surface, {backgroundColor: theme.colors.elevation.level3}]}>
        <View style={styles.header}>
          <View style={[styles.iconFrame, {backgroundColor: theme.colors.primaryContainer}]}>
            <Icon source="download" size={24} color={theme.colors.onPrimaryContainer} />
          </View>
          <View style={styles.headerText}>
            <Text variant="titleMedium">{t('pwa.install.title')}</Text>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{t('pwa.install.body')}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button mode="text" compact onPress={prompt.dontAskAgain}>{t('pwa.install.dontAsk')}</Button>
          <Button mode="text" compact onPress={prompt.dismiss}>{t('pwa.install.notNow')}</Button>
          <Button mode="contained" compact icon="download" onPress={install}>{t('pwa.install.install')}</Button>
        </View>
      </Surface>
      {steps}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end',
    marginTop: 12},
  header: {alignItems: 'flex-start', flexDirection: 'row', gap: 12},
  headerText: {flex: 1, gap: 2},
  iconFrame: {alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40},
  surface: {alignSelf: 'center', borderRadius: 16, maxWidth: 560, padding: 16, width: '100%'},
  wrapper: {bottom: 0, left: 0, paddingHorizontal: 12, position: 'absolute', right: 0},
});
