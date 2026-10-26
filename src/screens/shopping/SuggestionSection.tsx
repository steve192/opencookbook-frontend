import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {ShoppingRegular} from '../../api/types/shopping';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {TileGrid} from './TileGrid';

interface Props {
  suggested: ShoppingRegular[];
  isMoving: (regular: ShoppingRegular) => boolean;
  register: (regular: ShoppingRegular) => (view: View | null) => void;
  onAdd: (regular: ShoppingRegular) => void;
  onAddAll: () => void;
  onLongPress: (regular: ShoppingRegular) => void;
}

// What the list buys regularly and is due again, between what is to buy and what was bought.
export const SuggestionSection = (props: Props) => {
  const {t} = useTranslation('translation');
  const {suggested} = props;
  if (suggested.length === 0) {
    return null;
  }
  return (
    <View>
      <View style={styles.header}>
        <Text variant="titleSmall">{t('screens.shopping.suggestions.title')}</Text>
        <Button compact onPress={props.onAddAll}>{t('screens.shopping.suggestions.addAll')}</Button>
      </View>
      <TileGrid animated items={suggested} keyOf={(regular) => String(regular.id)} still={props.isMoving}
        renderTile={(regular) => (
          <ShoppingItemTile name={regular.name} icon={regular.icon} aisle={regular.aisle} suggested
            hidden={props.isMoving(regular)} viewRef={props.register(regular)}
            onPress={() => props.onAdd(regular)} onLongPress={() => props.onLongPress(regular)} />
        )} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4},
});
