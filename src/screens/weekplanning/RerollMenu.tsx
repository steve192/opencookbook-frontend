import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton, Menu} from 'react-native-paper';
import {RerollReason} from '../../dao/RestAPI';
import {REROLL_REASONS, rerollReasonLabel} from '../../helper/planDraft';

interface Props {
  disabled: boolean;
  /** Without a reason where the cook just wants something else. */
  onReroll: (reason?: RerollReason) => void;
}

// Something else for a meal, optionally saying what put the cook off, which steers the replacement.
export const RerollMenu = (props: Props) => {
  const {t} = useTranslation('translation');
  const [open, setOpen] = useState(false);

  const reroll = (reason?: RerollReason) => {
    setOpen(false);
    props.onReroll(reason);
  };

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <IconButton
          icon="refresh"
          size={20}
          disabled={props.disabled}
          accessibilityLabel={t('screens.planning.reroll')}
          onPress={() => setOpen(true)} />
      }>
      <Menu.Item leadingIcon="refresh" title={t('screens.planning.reroll')} onPress={() => reroll()} />
      {REROLL_REASONS.map((reason) => (
        <Menu.Item key={reason} title={rerollReasonLabel(t, reason)} onPress={() => reroll(reason)} />
      ))}
    </Menu>
  );
};
