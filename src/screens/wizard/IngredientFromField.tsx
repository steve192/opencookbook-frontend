import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {IconButton, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {SelectionPopup} from '../../components/SelectionPopup';
import RestAPI, {Ingredient, IngredientUse} from '../../dao/RestAPI';
import {useAppTheme} from '../../styles/CentralStyles';


interface Props {
    ingredient: IngredientUse
    ingredientIndex: number
    onIngredientChange: (newIngredient: IngredientUse, ingredientIndex: number) => void
    onRemovePress: (ingredientIndex: number) => void
}

export const IngredientFormField = React.memo(function IngredientFormField(props: Props) {
  const theme = useAppTheme();
  const [ingredientQuery, setIngredientQuery] = useState<string>(props.ingredient.ingredient.name);
  const [unit, setUnit] = useState<string>(props.ingredient.unit);
  const [amount, setAmount] = useState<string>(props.ingredient.amount === undefined || props.ingredient.amount === null ? '' : String(props.ingredient.amount));

  useEffect(() => {
    setIngredientQuery(props.ingredient.ingredient.name);
    setUnit(props.ingredient.unit);
    setAmount(props.ingredient.amount === undefined || props.ingredient.amount === null ? '' : String(props.ingredient.amount));
  }, [props.ingredient]);

  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

  const {t} = useTranslation('translation');

  const setIngredient = (text: string) => {
    setIngredientQuery(text);
    invokeIngredientUpdate(text, amount, unit);
  };

  const invokeIngredientUpdate = (ingredientName: string, newAmount: string, newUnit: string) => {
    const existingIngredient = availableIngredients.find((ingredient) => ingredient.name.toLowerCase() === ingredientName.toLowerCase());

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


  const queryIngredients = () => {
    RestAPI.getIngredients(ingredientQuery)
        .then((ingredients) => {
          setAvailableIngredients(
              ingredients,
              // ingredients.filter(item => item.name.toLowerCase().includes(ingredientQuery.toLowerCase()))
          );
        });
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


  useEffect(queryIngredients, [ingredientQuery]);
  useEffect(() => {
    RestAPI.getUnits().then((units) => {
      setAvailableUnits(units);
    });
  }, []);

  return (
    <View style={{borderWidth: 1, borderColor: theme.colors.outline, padding: 10, borderRadius: 16}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TextInput
              mode="outlined"
              style={{width: 100}}
              keyboardType="numeric"
              value={(amount !== undefined ? amount.toString() : '')}
              label={t('screens.editRecipe.amount')}
              onChangeText={onAmountChange} />
            <Spacer width={5} />
            <SelectionPopup
              style={{flex: 1}}
              label={t('screens.editRecipe.unit')}
              value={unit}
              options={availableUnits.map((availableUnit, index) => ({key: index.toString(), value: availableUnit}))}
              onValueChanged={(selectedOption) => setUnit(selectedOption.value)}
            />
          </View>
          <Spacer height={5} />
          <View style={{justifyContent: 'center', flex: 1}}>
            <SelectionPopup
              label={t('screens.editRecipe.ingredient')}
              value={ingredientQuery}
              options={availableIngredients.map((ingredient) => ({key: ingredient.id ? ingredient.id.toString() : '', value: ingredient.name}))}
              onValueChanged={(selectedOption) => setIngredient(selectedOption.value)}
              allowAdditionalValues={true}
            />
          </View>
        </View>
        <IconButton
          icon="delete-outline"
          onPress={() => props.onRemovePress(props.ingredientIndex)} />
      </View>
    </View>
  );
});
