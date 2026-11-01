import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {Option} from '../../components/SelectionPopupModal';
import {SelectionPopup} from '../../components/SelectionPopup';
import {Ingredient, IngredientUse} from '../../api/types/recipes';
import {INGREDIENT_LINE_MAX_LENGTH} from '../../helper/nameLimits';
import {amountText} from '../../helper/recipeEdits';
import {RowActions} from './RowActions';


interface Props {
    ingredient: IngredientUse
    ingredientIndex: number
    /** Built once by the screen: these lists are the same for every row */
    ingredientOptions: Option[]
    unitOptions: Option[]
    resolveIngredient: (name: string) => Ingredient
    canMoveUp: boolean
    canMoveDown: boolean
    onIngredientChange: (newIngredient: IngredientUse, ingredientIndex: number) => void
    onMove: (fromIndex: number, toIndex: number) => void
    onRemovePress: (ingredientIndex: number) => void
}

interface Fields {
  name: string;
  amount: string;
  unit: string;
  note: string;
}

/**
 * @param {string} text what is typed into the amount field
 * @return {number | null | undefined} the amount, null for none, undefined while it is no number yet ("1.")
 */
const typedAmount = (text: string): number | null | undefined => {
  if (text === '') {
    return null;
  }
  const amount = Number.parseFloat(text);
  return amount.toString() === text ? amount : undefined;
};

export const IngredientFormField = React.memo(function IngredientFormField(props: Props) {
  const [fields, setFields] = useState<Fields>(() => fieldsOf(props.ingredient));
  // A note field only where there is a note, or while one is being written
  const [writingNote, setWritingNote] = useState(false);
  const noteShown = writingNote || fields.note.trim() !== '';

  useEffect(() => {
    // What is typed stays where it says the same amount: "0" would otherwise turn into none
    setFields((typed) => ({
      ...fieldsOf(props.ingredient),
      amount: typedAmount(typed.amount) === props.ingredient.amount ? typed.amount : amountText(props.ingredient.amount),
    }));
  }, [props.ingredient]);

  const {t} = useTranslation('translation');

  // Passed on only while the amount is a number, so typing "1." does not lose the point
  const update = (changes: Partial<Fields>) => {
    const next = {...fields, ...changes};
    setFields(next);
    const amount = typedAmount(next.amount);
    if (amount !== undefined) {
      props.onIngredientChange({
        ingredient: props.resolveIngredient(next.name),
        amount,
        unit: next.unit,
        note: next.note,
      }, props.ingredientIndex);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.fields}>
        <View style={styles.amountRow}>
          <TextInput
            mode="outlined"
            dense={true}
            style={styles.amount}
            keyboardType="numeric"
            value={fields.amount}
            label={t('screens.editRecipe.amount')}
            onChangeText={(text) => update({amount: text.replace(',', '.')})} />
          <SelectionPopup
            style={styles.unit}
            dense={true}
            label={t('screens.editRecipe.unit')}
            value={fields.unit}
            options={props.unitOptions}
            onValueChanged={(selectedOption) => update({unit: selectedOption.value})}
          />
        </View>
        <SelectionPopup
          dense={true}
          label={t('screens.editRecipe.ingredient')}
          value={fields.name}
          options={props.ingredientOptions}
          onValueChanged={(selectedOption) => update({name: selectedOption.value})}
          allowCreate={true}
        />
        {noteShown ?
          <TextInput
            mode="outlined"
            dense={true}
            autoFocus={writingNote}
            value={fields.note}
            maxLength={INGREDIENT_LINE_MAX_LENGTH}
            label={t('screens.editRecipe.note')}
            onChangeText={(text) => update({note: text})}
            onFocus={() => setWritingNote(true)}
            onBlur={() => setWritingNote(false)} /> :
          <Button
            compact={true}
            icon="plus"
            style={styles.addNote}
            accessibilityLabel={t('screens.editRecipe.addNote')}
            onPress={() => setWritingNote(true)}>
            {t('screens.editRecipe.note')}
          </Button>}
      </View>
      <RowActions
        canMoveUp={props.canMoveUp}
        canMoveDown={props.canMoveDown}
        removeLabel={t('screens.editRecipe.removeIngredient')}
        onMoveUp={() => props.onMove(props.ingredientIndex, props.ingredientIndex - 1)}
        onMoveDown={() => props.onMove(props.ingredientIndex, props.ingredientIndex + 1)}
        onRemove={() => props.onRemovePress(props.ingredientIndex)} />
    </View>
  );
});

const fieldsOf = (ingredient: IngredientUse): Fields => ({
  name: ingredient.ingredient.name,
  amount: amountText(ingredient.amount),
  unit: ingredient.unit,
  note: ingredient.note,
});

const styles = StyleSheet.create({
  // No card border and no inner padding any more: the row used to cost about 140px of a
  // phone screen, which made a fifteen ingredient recipe a very long scroll.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fields: {
    flex: 1,
    gap: 4,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 6,
  },
  amount: {
    width: 84,
  },
  unit: {
    flex: 1,
  },
  addNote: {
    alignSelf: 'flex-start',
  },
});
