import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {TextInput, TextInputProps} from 'react-native-paper';
import {RowActions} from './RowActions';


type Props = TextInputProps & {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemovePress: () => void;
};

export const RecipeFormField = ({canMoveUp, canMoveDown, onMoveUp, onMoveDown, onRemovePress, ...inputProps}: Props) => {
  const {t} = useTranslation('translation');

  return (
    <View style={styles.row}>
      <TextInput
        mode='outlined'
        style={styles.input}
        {...inputProps} />
      <RowActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        removeLabel={t('screens.editRecipe.removeStep')}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemovePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    flex: 1,
  },
});
