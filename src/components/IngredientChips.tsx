import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Chip} from 'react-native-paper';
import {OwnIngredient} from '../helper/ownIngredients';
import CentralStyles from '../styles/CentralStyles';
import {Option, SelectionPopupModal} from './SelectionPopupModal';

interface Props {
  ingredients: OwnIngredient[];
  chosenIds: number[];
  addLabel: string;
  onToggle: (ingredientId: number) => void;
}

// Picked ingredients as removable chips, and one more chip to pick another.
export const IngredientChips = (props: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const chosen = useMemo(
      () => props.ingredients.filter((ingredient) => props.chosenIds.includes(ingredient.id)),
      [props.ingredients, props.chosenIds],
  );
  const options: Option[] = useMemo(
      () => props.ingredients
          .filter((ingredient) => !props.chosenIds.includes(ingredient.id))
          .map((ingredient) => ({key: String(ingredient.id), value: ingredient.name})),
      [props.ingredients, props.chosenIds],
  );

  return (
    <View style={CentralStyles.chipRow}>
      {chosen.map((ingredient) => (
        <Chip key={ingredient.id} closeIcon="close" onClose={() => props.onToggle(ingredient.id)}>
          {ingredient.name}
        </Chip>
      ))}
      <Chip icon="plus" onPress={() => setPickerOpen(true)}>{props.addLabel}</Chip>
      {pickerOpen && <SelectionPopupModal
        modalVisible={pickerOpen}
        options={options}
        placeholder={props.addLabel}
        allowCreate={false}
        onClose={() => setPickerOpen(false)}
        onSelection={(option) => {
          props.onToggle(Number(option.key));
          setPickerOpen(false);
        }} />}
    </View>
  );
};
