import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, Icon, Portal, Text} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

// iOS has no install api, so these steps are the closest there is to the browser's install dialog.
export const PwaIosInstructionsDialog = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const step = (icon: string, text: string) => (
    <View style={styles.step}>
      <View style={[styles.iconFrame, {backgroundColor: theme.colors.primaryContainer}]}>
        <Icon source={icon} size={24} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="bodyMedium" style={styles.stepText}>{text}</Text>
    </View>
  );
  return (
    <Portal>
      <Dialog visible={props.visible} onDismiss={props.onDismiss}>
        <Dialog.Title>{t('pwa.install.iosTitle')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.intro}>{t('pwa.install.iosIntro')}</Text>
          {step('export-variant', t('pwa.install.iosStep1'))}
          {step('plus-box-outline', t('pwa.install.iosStep2'))}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.onDismiss}>{t('common.dismiss')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  iconFrame: {alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36},
  intro: {marginBottom: 16},
  step: {alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 12},
  stepText: {flex: 1},
});
