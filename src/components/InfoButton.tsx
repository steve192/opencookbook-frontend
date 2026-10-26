import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Dialog, IconButton, Portal, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

interface Props {
  /** Finished texts: what is explained, and the explanation. */
  title: string;
  text: string;
}

// The one way to explain a term: an info icon that opens the explanation.
export const InfoButton = (props: Props) => {
  const {t} = useTranslation('translation');
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton icon="information-outline" size={18} style={styles.button}
        accessibilityLabel={t('common.moreAbout', {topic: props.title})} onPress={() => setOpen(true)} />
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>{props.title}</Dialog.Title>
          <Dialog.Content><Text variant="bodyMedium">{props.text}</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setOpen(false)}>{t('common.ok')}</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {margin: 0},
});
