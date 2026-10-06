import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Chip, Dialog, Menu, Text, TextInput} from 'react-native-paper';
import XDate from 'xdate';
import {ShoppingIcon} from '../../components/shopping/ShoppingIcon';
import {PRIORITY_ICON} from '../../components/shopping/ShoppingItemTile';
import {Aisle, AISLES} from '../../api/aisles';
import {ShoppingItem, ShoppingItemSource, ShoppingOp} from '../../api/types/shopping';
import {formatShortWeekday} from '../../helper/weekplan';
import {withPortal} from '../../helper/withPortal';
import {overlayStyles, useAppTheme} from '../../styles/CentralStyles';

/** What the dialog lets a person change: an update op without its ids. */
export type ItemEdit = Pick<Extract<ShoppingOp, {type: 'UPDATE'}>, 'name' | 'spec' | 'aisle' | 'prioritized'>;

interface Props {
  item: ShoppingItem;
  onDismiss: () => void;
  /** Only what changed; nothing when nothing did. */
  onSave: (changes: ItemEdit) => void;
  onRemove: () => void;
}

// Everything about one item: what it is, how much, where it is sold, and why it is on the list.
export const ShoppingItemDialog = withPortal(function ShoppingItemDialog({item, onDismiss, onSave, onRemove}: Props) {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const [name, setName] = useState(item.name);
  const [spec, setSpec] = useState(item.spec ?? '');
  const [aisle, setAisle] = useState<Aisle>(item.aisle);
  const [prioritized, setPrioritized] = useState(!!item.prioritized);
  const [aisleMenuOpen, setAisleMenuOpen] = useState(false);
  const aisleName = (shown: Aisle) => t(`aisles.${shown}`);

  const sourceLabel = (source: ShoppingItemSource) => source.planDate ?
    `${source.title} (${formatShortWeekday(new XDate(source.planDate), i18n.language)})` : source.title;

  const save = () => {
    onSave({
      name: name.trim() && name.trim() !== item.name ? name.trim() : undefined,
      spec: spec.trim() !== (item.spec ?? '') ? spec.trim() : undefined,
      aisle: aisle !== item.aisle ? aisle : undefined,
      prioritized: prioritized !== !!item.prioritized ? prioritized : undefined,
    });
    onDismiss();
  };

  return (
    <Dialog visible style={overlayStyles.dialogView} onDismiss={onDismiss}>
      <Dialog.Title>{t('screens.shopping.itemTitle')}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput mode="outlined" label={t('screens.shopping.itemName')} value={name} onChangeText={setName}
            maxLength={120} />
          <TextInput mode="outlined" label={t('screens.shopping.itemSpec')} value={spec} onChangeText={setSpec}
            maxLength={200} />
          <Menu
            visible={aisleMenuOpen}
            onDismiss={() => setAisleMenuOpen(false)}
            anchor={
              <Button mode="outlined" onPress={() => setAisleMenuOpen(true)}
                icon={aisleIcon(aisle)}>
                {`${t('screens.shopping.aisle')}: ${aisleName(aisle)}`}
              </Button>}>
            {AISLES.map((option) => (
              <Menu.Item key={option} title={aisleName(option)}
                leadingIcon={aisleIcon(option)}
                onPress={() => {
                  setAisle(option);
                  setAisleMenuOpen(false);
                }} />
            ))}
          </Menu>
          {item.status === 'ACTIVE' &&
            <Chip icon={PRIORITY_ICON} selected={prioritized} showSelectedCheck={false}
              mode={prioritized ? 'flat' : 'outlined'}
              selectedColor={prioritized ? theme.colors.error : theme.colors.onSurfaceVariant}
              style={[styles.chip, prioritized && {backgroundColor: theme.colors.errorContainer}]}
              onPress={() => setPrioritized(!prioritized)}>
              {t('screens.shopping.prioritized')}
            </Chip>}
          {item.sources.length > 0 &&
            <Text variant="bodyMedium">
              {t('screens.shopping.forMeals', {meals: item.sources.map(sourceLabel).join(', ')})}
            </Text>}
          {item.addedBy && <Text variant="bodySmall">{t('screens.shopping.addedBy', {name: item.addedBy})}</Text>}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <View style={styles.grow}>
          <Button icon="delete-outline" onPress={() => {
            onRemove();
            onDismiss();
          }}>{t('screens.shopping.removeItem')}</Button>
        </View>
        <Button onPress={onDismiss}>{t('common.cancel')}</Button>
        <Button onPress={save}>{t('common.save')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
});

const aisleIcon = (aisle: Aisle) => function AisleIcon() {
  return <ShoppingIcon icon={null} aisle={aisle} size={20} />;
};

const styles = StyleSheet.create({
  content: {gap: 12, paddingVertical: 8},
  grow: {flex: 1, alignItems: 'flex-start'},
  chip: {alignSelf: 'flex-start'},
});
