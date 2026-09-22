import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Dialog, Portal, Text, TextInput} from 'react-native-paper';
import {overlayStyles} from '../styles/CentralStyles';
import {createGlobalOverlay} from './globalOverlay';

interface Options {
  title: string;
  /** Above the field, for what is not obvious from the title. */
  message?: string;
  /** What the field is called. */
  label: string;
  /** What it starts out as; usually a sensible default rather than an empty field. */
  initialValue?: string;
  maxLength?: number;
  confirm: string;
  cancel: string;
  onConfirm: (value: string) => void;
}

const overlay = createGlobalOverlay<Options>();

/**
 * The one-line text dialog any screen can raise through {@link TextPromptUtil}. Blank is never an answer.
 *
 * @return {React.ReactElement | null} the dialog, while one is asked for
 */
export const TextPrompt = () => {
  const [options, setOptions] = useState<Options>();
  const [value, setValue] = useState('');

  overlay.useOpener((asked) => setOptions(asked));

  useEffect(() => setValue(options?.initialValue ?? ''), [options]);

  if (!options) {
    return null;
  }

  const close = () => setOptions(undefined);

  const confirm = () => {
    options.onConfirm(value.trim());
    close();
  };

  return (
    <Portal>
      <Dialog visible style={overlayStyles.dialogView} onDismiss={close}>
        <Dialog.Title>{options.title}</Dialog.Title>
        <Dialog.Content>
          {options.message !== undefined &&
            <Text variant="bodyMedium" style={styles.message}>{options.message}</Text>
          }
          <TextInput
            mode="outlined"
            autoFocus
            label={options.label}
            value={value}
            maxLength={options.maxLength}
            onChangeText={setValue}
            onSubmitEditing={() => value.trim().length > 0 && confirm()} />
        </Dialog.Content>
        <Dialog.Actions style={overlayStyles.dialogActions}>
          <Button onPress={close}>{options.cancel}</Button>
          <Button mode="contained" disabled={value.trim().length === 0} onPress={confirm}>
            {options.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  message: {
    marginBottom: 12,
  },
});

export const TextPromptUtil = {
  show: overlay.show,
};
