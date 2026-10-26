import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, Text} from 'react-native-paper';
import {ShoppingRegular} from '../../api/types/shopping';
import {ShoppingIcon} from '../../components/shopping/ShoppingIcon';
import {useRhythmTexts} from '../../helper/shopping/rhythmTexts';
import {withPortal} from '../../helper/withPortal';
import {useIsOnline} from '../../offline/useIsOnline';
import {overlayStyles} from '../../styles/CentralStyles';

interface Props {
  regular: ShoppingRegular;
  onDismiss: () => void;
  onAdd: () => void;
  onNotNow: () => void;
  onNever: () => void;
}

// Why a suggestion is there, and what to do with it. Putting it off needs the server, adding does not.
export const SuggestionDialog = withPortal(function SuggestionDialog(props: Props) {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const texts = useRhythmTexts();
  const choose = (action: () => void) => () => {
    action();
    props.onDismiss();
  };
  return (
    <Dialog visible style={overlayStyles.dialogView} onDismiss={props.onDismiss}>
      <Dialog.Content style={styles.content}>
        <View style={styles.heading}>
          <ShoppingIcon icon={props.regular.icon} aisle={props.regular.aisle} size={36} />
          <Text variant="titleLarge" style={styles.name}>{props.regular.name}</Text>
        </View>
        {props.regular.everyDays !== null && <Text variant="bodyMedium">{texts.every(props.regular.everyDays)}</Text>}
        {props.regular.lastBoughtAt && <Text variant="bodyMedium">{texts.lastBought(props.regular.lastBoughtAt)}</Text>}
      </Dialog.Content>
      <Dialog.Actions style={styles.actions}>
        <Button mode="contained" icon="cart-plus" onPress={choose(props.onAdd)}>
          {t('screens.shopping.suggestions.add')}
        </Button>
        <Button disabled={!online} onPress={choose(props.onNotNow)}>{t('screens.shopping.suggestions.notNow')}</Button>
        <Button disabled={!online} onPress={choose(props.onNever)}>{t('screens.shopping.suggestions.never')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
});

const styles = StyleSheet.create({
  content: {gap: 8},
  heading: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4},
  name: {flex: 1},
  // Stacked, since three labels do not fit side by side on a phone.
  actions: {flexDirection: 'column', alignItems: 'stretch', gap: 4},
});
