import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {IngredientNote} from '../../components/IngredientNote';
import {INGREDIENT_LINE_MAX_LENGTH} from '../../helper/nameLimits';
import {EditedIngredient, ingredientText} from '../../helper/recipeEdits';
import {amountLabel} from '../../helper/servings';
import {useAppTheme} from '../../styles/CentralStyles';
import {RowActions} from './RowActions';

export type IngredientInput = React.ComponentRef<typeof TextInput>;

interface Props {
  ingredient: EditedIngredient;
  ingredientIndex: number;
  online: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  registerInput: (index: number, input: IngredientInput | null) => void;
  onWrite: (index: number, text: string) => void;
  /** Puts a blank row at that index. */
  onAddIngredient: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemovePress: (index: number) => void;
}

// One ingredient as one line of text, with what the server read from it underneath.
export const IngredientTextField = React.memo(function IngredientTextField(props: Props) {
  const theme = useAppTheme();
  const {t, i18n} = useTranslation('translation');
  const {ingredient, ingredientIndex} = props;
  const text = ingredientText(ingredient, i18n.language);
  const waiting = ingredient.written?.read === false;

  const readLine = (content: React.ReactNode, color: string) =>
    <Text variant="bodySmall" style={[styles.read, {color}]}>{content}</Text>;

  const renderRead = () => {
    if (text.trim() === '') {
      return null;
    }
    if (waiting && !props.online) {
      return readLine(t('screens.editRecipe.readWhenOnline'), theme.colors.onSurfaceVariant);
    }
    if (ingredient.ingredient.name === '') {
      return waiting ? null : readLine(t('screens.editRecipe.noIngredientFound'), theme.colors.error);
    }
    const amount = amountLabel(ingredient, i18n.language);
    return readLine(
        <>
          {amount !== '' &&
            <Text style={[styles.amount, {color: waiting ? theme.colors.onSurfaceDisabled : theme.colors.primaryText}]}>
              {`${amount} `}
            </Text>}
          {ingredient.ingredient.name}
          <IngredientNote note={ingredient.note} color={waiting ? theme.colors.onSurfaceDisabled : undefined} />
        </>,
        waiting ? theme.colors.onSurfaceDisabled : theme.colors.onSurface);
  };

  return (
    <View style={styles.ingredient}>
      <View style={styles.row}>
        <TextInput
          ref={(input: IngredientInput | null) => props.registerInput(ingredientIndex, input)}
          style={styles.input}
          mode="outlined"
          dense={true}
          label={t('screens.editRecipe.ingredient')}
          placeholder={t('screens.editRecipe.ingredientTextPlaceholder')}
          value={text}
          maxLength={INGREDIENT_LINE_MAX_LENGTH}
          returnKeyType="next"
          submitBehavior="submit"
          onChangeText={(newText) => props.onWrite(ingredientIndex, newText)}
          onSubmitEditing={() => {
            if (text.trim() !== '') {
              props.onAddIngredient(ingredientIndex + 1);
            }
          }} />
        <RowActions
          horizontal={true}
          canMoveUp={props.canMoveUp}
          canMoveDown={props.canMoveDown}
          removeLabel={t('screens.editRecipe.removeIngredient')}
          onMoveUp={() => props.onMove(ingredientIndex, ingredientIndex - 1)}
          onMoveDown={() => props.onMove(ingredientIndex, ingredientIndex + 1)}
          onRemove={() => props.onRemovePress(ingredientIndex)} />
      </View>
      {renderRead()}
    </View>
  );
});

const styles = StyleSheet.create({
  ingredient: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    flex: 1,
  },
  // In line with the text of the field above
  read: {
    paddingHorizontal: 14,
  },
  amount: {
    fontWeight: 'bold',
  },
});
