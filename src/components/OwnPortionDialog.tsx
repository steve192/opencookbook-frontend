import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, Dialog, Text, TextInput} from 'react-native-paper';
import {useRemoveOwnPortionMutation, useSetOwnPortionMutation} from '../api/endpoints/nutrition';
import {NutritionLine} from '../api/types/nutrition';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {withPortal} from '../helper/withPortal';
import {overlayStyles, useAppTheme} from '../styles/CentralStyles';

// The server's limit.
const MAX_GRAMS = 10000;

interface Props {
  line: NutritionLine & {ingredientId: number};
  onDismiss: () => void;
  onSaved: () => void;
}

// The weight applies to every recipe of the owner using this ingredient with this unit.
export const OwnPortionDialog = withPortal(function OwnPortionDialog(props: Props) {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();

  const unit = props.line.unit ?? '';
  const [grams, setGrams] = useState('');
  const [setOwnPortion, setting] = useSetOwnPortionMutation();
  const [removeOwnPortion, removing] = useRemoveOwnPortionMutation();
  const saving = setting.isLoading || removing.isLoading;
  // Shown inside the dialog: a snackbar would be hidden behind it.
  const [failure, setFailure] = useState<string>();

  const parsed = Number(grams.replace(',', '.'));
  const valid = grams.trim() !== '' && parsed > 0 && parsed <= MAX_GRAMS;

  const run = async (action: () => Promise<void>) => {
    setFailure(undefined);
    try {
      await action();
      props.onSaved();
    } catch (e) {
      setFailure(t(errorMessageKey(e, 'nutrition.portion.failed')));
    }
  };

  return (
    <Dialog style={overlayStyles.dialogView} visible={true} onDismiss={props.onDismiss} testID='own-portion-dialog'>
      <Dialog.Title>
        {t('nutrition.portion.title', {unit: unit || t('nutrition.portion.piece'), ingredient: props.line.ingredientName})}
      </Dialog.Title>
      <Dialog.Content style={styles.content}>
        <TextInput
          testID='own-portion-grams'
          mode="outlined"
          label={t('nutrition.portion.grams')}
          keyboardType="decimal-pad"
          value={grams}
          onChangeText={setGrams}
          right={<TextInput.Affix text="g" />}
          placeholder={(100).toLocaleString(i18n.language)} />
        {grams.trim() !== '' && !valid &&
          <Text style={{color: theme.colors.error}}>{t('nutrition.portion.invalid')}</Text>
        }
        <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('nutrition.portion.appliesEverywhere')}</Text>
        {failure && <Text style={{color: theme.colors.error}}>{failure}</Text>}
      </Dialog.Content>
      <Dialog.Actions style={overlayStyles.dialogActions}>
        {props.line.ownPortion &&
          <Button disabled={saving} onPress={() => run(() => removeOwnPortion({ingredientId: props.line.ingredientId, unit}).unwrap())}>
            {t('nutrition.portion.remove')}
          </Button>
        }
        <Button disabled={saving} onPress={props.onDismiss}>{t('common.cancel')}</Button>
        <Button
          testID='own-portion-save'
          mode="contained"
          loading={saving}
          disabled={saving || !valid}
          onPress={() => run(() => setOwnPortion({ingredientId: props.line.ingredientId, unit, grams: parsed}).unwrap())}>
          {t('nutrition.portion.save')}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
});
