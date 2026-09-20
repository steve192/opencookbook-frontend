import React, {useState} from 'react';
import {Portal, Snackbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '../styles/CentralStyles';
import {createGlobalOverlay} from './globalOverlay';

interface Options {
  message: string;
  /** An offer to act on the message, to undo it most of the time. */
  action?: string;
  onAction?: () => void;
  /** How long to leave it up. Defaults to long enough to read, not long enough to annoy. */
  duration?: number;
}

/** Long enough to read a sentence. The old twenty seconds sat over the screen for an age. */
const DEFAULT_DURATION = 6000;

/** An offer to undo something is worth waiting a little longer for. */
const ACTION_DURATION = 10000;

const overlay = createGlobalOverlay<Options>();

/**
 * The snackbar any screen can raise through {@link SnackbarUtil}.
 *
 * @return {React.ReactElement | null} the snackbar, while there is a message
 */
export const GlobalSnackbar = () => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');
  const [options, setOptions] = useState<Options>();
  // Apart from the message, so it can fade out with the text it faded in with.
  const [visible, setVisible] = useState(false);

  overlay.useOpener((shown) => {
    setOptions(shown);
    setVisible(true);
  });

  if (!options) {
    return null;
  }

  const dismiss = () => setVisible(false);
  const action = options.action;

  return (
    <Portal>
      <Snackbar
        duration={options.duration ?? (action ? ACTION_DURATION : DEFAULT_DURATION)}
        visible={visible}
        onDismiss={dismiss}
        // A close button, always. The snackbar covers whatever is at the bottom of the screen,
        // which on most screens is the primary action, and without this there was no way to
        // get rid of it but to wait it out.
        onIconPress={dismiss}
        iconAccessibilityLabel={t('common.dismiss')}
        action={action ? {
          label: action,
          onPress: () => {
            options.onAction?.();
            dismiss();
          },
          buttonColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
        } : undefined}>
        {options.message}
      </Snackbar>
    </Portal>
  );
};

export const SnackbarUtil = {
  show: overlay.show,
};
