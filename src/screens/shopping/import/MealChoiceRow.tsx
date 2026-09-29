import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Chip, Icon, Text, TextInput} from 'react-native-paper';
import XDate from 'xdate';
import {CountStepper} from '../../../components/CountStepper';
import {LEFTOVERS_ICON, useLeftoversLabel} from '../../../helper/leftovers';
import {MealChoice} from '../../../helper/shopping/importLines';
import {formatWeekdayAndDate} from '../../../helper/weekplan';
import {useAppTheme} from '../../../styles/CentralStyles';

interface Props {
  choice: MealChoice;
  onChange: (choice: MealChoice) => void;
}

const MAX_SERVINGS = 50;

// One meal of the sheet: whether it is shopped for, for how many, and for a meal without a recipe, what.
export const MealChoiceRow = ({choice, onChange}: Props) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const leftoversLabel = useLeftoversLabel();
  const [typing, setTyping] = useState('');
  const {meal} = choice;

  const addTyped = () => {
    if (typing.trim().length > 0) {
      onChange({...choice, typedItems: [...choice.typedItems, typing.trim()]});
      setTyping('');
    }
  };

  if (meal.leftoverOf) {
    return (
      <View style={[styles.row, styles.meal]}>
        <View style={styles.leftoverIcon}>
          <Icon source={LEFTOVERS_ICON} size={22} color={theme.colors.onSurfaceVariant} />
        </View>
        <View style={styles.grow}>
          <Text variant="bodyLarge">{meal.title}</Text>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {t('screens.shopping.import.leftoversNothingToBuy', {leftovers: leftoversLabel(meal.leftoverOf)})}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.meal}>
      <View style={styles.row}>
        <Checkbox.Android
          status={choice.included ? 'checked' : 'unchecked'}
          onPress={() => onChange({...choice, included: !choice.included})} />
        <View style={styles.grow}>
          {meal.spontaneous ?
            <Text variant="bodyLarge">{meal.title}</Text> :
            <CountStepper
              label={meal.title}
              value={String(choice.servings)}
              decreaseLabel={t('screens.shopping.import.fewerServings')}
              increaseLabel={t('screens.shopping.import.moreServings')}
              canDecrease={choice.included && choice.servings > 1}
              canIncrease={choice.included && choice.servings < MAX_SERVINGS}
              onDecrease={() => onChange({...choice, servings: choice.servings - 1})}
              onIncrease={() => onChange({...choice, servings: choice.servings + 1})} />}
          {meal.date &&
            <Text variant="bodySmall">{formatWeekdayAndDate(new XDate(meal.date), i18n.language)}</Text>}
        </View>
      </View>
      {meal.spontaneous && choice.included &&
        <View style={styles.typed}>
          <Text variant="bodySmall">{t('screens.shopping.import.spontaneous')}</Text>
          <View style={styles.chips}>
            {choice.typedItems.map((item, index) => (
              <Chip key={`${item}-${index}`} compact
                onClose={() => onChange({...choice, typedItems: choice.typedItems.filter((_, other) => other !== index)})}>
                {item}
              </Chip>
            ))}
          </View>
          <TextInput
            dense
            mode="outlined"
            value={typing}
            placeholder={t('screens.shopping.import.addItemsPlaceholder')}
            onChangeText={setTyping}
            onSubmitEditing={addTyped}
            onBlur={addTyped}
            submitBehavior="submit"
            right={<TextInput.Icon icon="plus" onPress={addTyped} />} />
        </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  meal: {paddingVertical: 4},
  row: {flexDirection: 'row', alignItems: 'center'},
  grow: {flex: 1},
  // As wide as a checkbox, so titles line up.
  leftoverIcon: {width: 36, alignItems: 'center'},
  typed: {marginLeft: 40, gap: 6},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
});
