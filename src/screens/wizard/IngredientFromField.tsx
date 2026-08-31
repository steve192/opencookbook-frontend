import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {Option} from '../../components/SelectionPopupModal';
import {SelectionPopup} from '../../components/SelectionPopup';
import {Ingredient, IngredientUse} from '../../dao/RestAPI';
import {RowActions} from './RowActions';


interface Props {
    ingredient: IngredientUse
    ingredientIndex: number
    /** Built once by the screen: these lists are the same for every row */
    ingredientOptions: Option[]
    unitOptions: Option[]
    resolveIngredient: (name: string) => Ingredient | undefined
    canMoveUp: boolean
    canMoveDown: boolean
    onIngredientChange: (newIngredient: IngredientUse, ingredientIndex: number) => void
    onMove: (fromIndex: number, toIndex: number) => void
    onRemovePress: (ingredientIndex: number) => void
}

export const IngredientFormField = React.memo(function IngredientFormField(props: Props) {
  const [ingredientQuery, setIngredientQuery] = useState<string>(props.ingredient.ingredient.name);
  const [unit, setUnit] = useState<string>(props.ingredient.unit);
  const [amount, setAmount] = useState<string>(props.ingredient.amount === undefined || props.ingredient.amount === null ? '' : String(props.ingredient.amount));

  useEffect(() => {
    setIngredientQuery(props.ingredient.ingredient.name);
    setUnit(props.ingredient.unit);
    setAmount(props.ingredient.amount === undefined || props.ingredient.amount === null ? '' : String(props.ingredient.amount));
  }, [props.ingredient]);

  const {t} = useTranslation('translation');

  const setIngredient = (text: string) => {
    setIngredientQuery(text);
    invokeIngredientUpdate(text, amount, unit);
  };

  const invokeIngredientUpdate = (ingredientName: string, newAmount: string, newUnit: string) => {
    const existingIngredient = props.resolveIngredient(ingredientName);

    let prasedAmount: number | null = parseFloat(newAmount);
    // Check if its a number
    if (prasedAmount.toString() !== newAmount || newAmount === '') {
      prasedAmount = null;
    }

    if (existingIngredient) {
      props.onIngredientChange({ingredient: existingIngredient, amount: prasedAmount, unit: newUnit}, props.ingredientIndex);
    } else {
      props.onIngredientChange({ingredient: {name: ingredientName}, amount: prasedAmount, unit: newUnit}, props.ingredientIndex);
    }
  };

  const onUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    invokeIngredientUpdate(ingredientQuery, amount, newUnit);
  };

  const onAmountChange = (text: string) => {
    text = text.replace(',', '.');
    setAmount(text);

    const prasedAmount = parseFloat(text);
    // Check if its a number
    if (prasedAmount.toString() === text || text === '') {
      invokeIngredientUpdate(ingredientQuery, text, unit);
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
            value={amount}
            label={t('screens.editRecipe.amount')}
            onChangeText={onAmountChange} />
          <SelectionPopup
            style={styles.unit}
            dense={true}
            label={t('screens.editRecipe.unit')}
            value={unit}
            options={props.unitOptions}
            onValueChanged={(selectedOption) => onUnitChange(selectedOption.value)}
          />
        </View>
        <SelectionPopup
          dense={true}
          label={t('screens.editRecipe.ingredient')}
          value={ingredientQuery}
          options={props.ingredientOptions}
          onValueChanged={(selectedOption) => setIngredient(selectedOption.value)}
          allowAdditionalValues={true}
        />
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
});
