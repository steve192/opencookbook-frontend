import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Dialog, Text, TextInput} from 'react-native-paper';
import {overlayStyles} from '../styles/CentralStyles';
import {createGlobalOverlay} from './globalOverlay';
import {withPortal} from './withPortal';

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

  overlay.useOpener(setOptions);

  if (!options) {
    return null;
  }

  return <TextPromptDialog options={options} onClose={() => setOptions(undefined)} />;
};

const TextPromptDialog = withPortal(function TextPromptDialog({options, onClose}: {options: Options, onClose: () => void}) {
  const [value, setValue] = useState(options.initialValue ?? '');

  const confirm = () => {
    options.onConfirm(value.trim());
    onClose();
  };

  return (
    <Dialog visible style={overlayStyles.dialogView} onDismiss={onClose}>
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
        <Button onPress={onClose}>{options.cancel}</Button>
        <Button mode="contained" disabled={value.trim().length === 0} onPress={confirm}>
          {options.confirm}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
});

const styles = StyleSheet.create({
  message: {
    marginBottom: 12,
  },
});

export const TextPromptUtil = {
  show: overlay.show,
};
