import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, Portal, Text, TextInput} from 'react-native-paper';
import {IssuedApiKey} from '../../dao/RestAPI';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {SHARE_TEXT_COPIES, shareText} from '../../helper/shareText';
import {overlayStyles} from '../../styles/CentralStyles';

interface Props {
  issued: IssuedApiKey;
  onDismiss: () => void;
}

export const ApiKeyCreatedDialog = ({issued, onDismiss}: Props) => {
  const {t} = useTranslation('translation');

  const handOver = () => {
    shareText(issued.secret)
        .then((outcome) => {
          if (outcome === 'copied') {
            SnackbarUtil.show({message: t('screens.apiKeys.copied')});
          }
        })
        .catch(() => SnackbarUtil.show({message: t('screens.apiKeys.copyFailed')}));
  };

  return (
    <Portal>
      <Dialog visible dismissable={false} style={overlayStyles.dialogView}>
        <Dialog.Title>{t('screens.apiKeys.createdTitle')}</Dialog.Title>
        <Dialog.Content>
          <View style={styles.content}>
            <Text variant="bodyMedium">{t('screens.apiKeys.createdMessage', {name: issued.key.name})}</Text>
            <TextInput mode="outlined" value={issued.secret} readOnly selectTextOnFocus />
            <Button icon={SHARE_TEXT_COPIES ? 'content-copy' : 'share-variant'} onPress={handOver}>
              {SHARE_TEXT_COPIES ? t('screens.apiKeys.copy') : t('screens.apiKeys.share')}
            </Button>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('common.done')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  content: {gap: 12},
});
