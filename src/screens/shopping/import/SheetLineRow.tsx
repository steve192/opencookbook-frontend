import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Text, TouchableRipple} from 'react-native-paper';
import {ShoppingIcon} from '../../../components/shopping/ShoppingIcon';
import {SheetLine} from '../../../helper/shopping/importLines';
import {useAppTheme} from '../../../styles/CentralStyles';

interface Props {
  line: SheetLine;
  ticked: boolean;
  /** What the target list already has of it, for a CookPal list; undefined when it has none. */
  onList?: string | null;
  onToggle: () => void;
}

// One line of the checklist, and why it might be left out: usually at home, or already on the list.
export const SheetLineRow = ({line, ticked, onList, onToggle}: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const onListNote = () => {
    if (onList === undefined) {
      return null;
    }
    return onList ? t('screens.shopping.import.alreadyOnList', {spec: onList}) :
      t('screens.shopping.import.alreadyOnListPlain');
  };
  const notes = [
    line.sources.length > 1 ? t('screens.shopping.import.forMeals', {count: line.sources.length}) : null,
    line.staple ? t('screens.shopping.import.staple') : null,
    onListNote(),
  ].filter(Boolean).join(' · ');

  return (
    <TouchableRipple onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{checked: ticked}}>
      <View style={styles.row}>
        <Checkbox.Android status={ticked ? 'checked' : 'unchecked'} onPress={onToggle} />
        <ShoppingIcon icon={line.icon} aisle={line.aisle} size={28} />
        <View style={styles.text}>
          <Text variant="bodyLarge">{line.name}</Text>
          {notes.length > 0 && <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{notes}</Text>}
        </View>
        {!!line.spec && <Text variant="bodyMedium" style={{color: theme.colors.primaryText}}>{line.spec}</Text>}
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingRight: 8},
  text: {flex: 1},
});
