import React, {useState} from 'react';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';
import {overlayStyles, useAppTheme} from '../styles/CentralStyles';
import {createGlobalOverlay} from './globalOverlay';

interface Options {
  title: string;
  message: string;
  /** Goes ahead with what was asked. Rendered last, as the filled button. */
  confirm?: string;
  onConfirm?: () => void;
  /** Backs out. Rendered first, as plain text. */
  cancel?: string;
  onCancel?: () => void;
  /** Colours the confirming answer red, for the ones that delete or revoke. */
  destructive?: boolean;
}

const overlay = createGlobalOverlay<Options>();

/**
 * The confirmation dialog any screen can raise through {@link PromptUtil}.
 *
 * @return {React.ReactElement | null} the dialog, while one is asked for
 */
export const Prompt = () => {
  const theme = useAppTheme();
  const [options, setOptions] = useState<Options>();

  overlay.useOpener(setOptions);

  if (!options) {
    return null;
  }

  const close = () => setOptions(undefined);

  const answer = (callback?: () => void) => {
    callback?.();
    close();
  };

  return (
    <Portal>
      <Dialog visible style={overlayStyles.dialogView} onDismiss={close}>
        <Dialog.Title>{options.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{options.message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions style={overlayStyles.dialogActions}>
          {options.cancel !== undefined &&
            <Button onPress={() => answer(options.onCancel)}>{options.cancel}</Button>
          }
          {options.confirm !== undefined &&
            <Button
              mode="contained"
              buttonColor={options.destructive ? theme.colors.destructive : undefined}
              textColor={options.destructive ? theme.colors.onDestructive : undefined}
              onPress={() => answer(options.onConfirm)}>
              {options.confirm}
            </Button>
          }
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export const PromptUtil = {
  show: overlay.show,
};
