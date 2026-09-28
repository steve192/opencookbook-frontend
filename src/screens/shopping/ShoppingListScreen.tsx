import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Keyboard, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {Appbar, Searchbar, Surface, Text} from 'react-native-paper';
import {ShoppingItemTile} from '../../components/shopping/ShoppingItemTile';
import {ShoppingListMenu} from '../../components/shopping/ShoppingListMenu';
import {ShoppingItem, ShoppingList, ShoppingOp, ShoppingTile} from '../../dao/RestAPI';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {parseQuickAdd} from '../../helper/shopping/quickAdd';
import {tileNamed} from '../../helper/shopping/tiles';
import {useListName} from '../../helper/shopping/useListName';
import {useShoppingVocabulary} from '../../helper/shopping/useShoppingVocabulary';
import {activeItems, recentlyBought, visibleItems} from '../../helper/shopping/listItems';
import {changeShoppingList, loadShoppingLists, newClientId, syncShoppingList} from '../../helper/shopping/shoppingSync';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {shoppingListChosen} from '../../redux/features/shoppingSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {QuickAddPanel} from './QuickAddPanel';
import {ItemEdit, ShoppingItemDialog} from './ShoppingItemDialog';
import {TileGrid} from './TileGrid';

type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'ShoppingScreen'>,
        NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
    >;

// The list to shop with: tap a tile when it is in the basket, type or browse to add.
export const ShoppingListScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.settings.isOnline);
  const lists = useAppSelector((state) => state.shopping.lists);
  const activeListId = useAppSelector((state) => state.shopping.activeListId);
  const held = useAppSelector((state) => activeListId === null ? undefined : state.shopping.sync[activeListId]);
  const {tiles, unitWords} = useShoppingVocabulary();

  const [typed, setTyped] = useState('');
  const [adding, setAdding] = useState(false);
  const [openItem, setOpenItem] = useState<ShoppingItem>();
  const [refreshing, setRefreshing] = useState(false);

  const activeList = lists.find((list) => list.id === activeListId);
  const nameOf = useListName();
  const items = useMemo(
      () => visibleItems(held, new Date().toISOString()), [held]);
  const active = useMemo(() => activeItems(items), [items]);
  const bought = useMemo(() => recentlyBought(items), [items]);

  const refresh = useCallback(async () => {
    if (!isOnline) {
      return;
    }
    await dispatch(loadShoppingLists()).catch(() => undefined);
    if (activeListId !== null) {
      await dispatch(syncShoppingList(activeListId));
    }
  }, [isOnline, activeListId]);

  const chooseList = (list: ShoppingList) => {
    dispatch(shoppingListChosen(list.id));
    dispatch(syncShoppingList(list.id));
  };

  const manageLists = () => props.navigation.navigate('ShoppingListsScreen');

  useEffect(() => {
    const applyHeaderOptions = () => {
      if (!props.navigation.isFocused()) {
        return;
      }
      setAppbarOptions(props.navigation.getParent(), {
        title: activeList ? nameOf(activeList) : t('screens.shopping.screenTitle'),
        leading: undefined,
        actions: (
          <ShoppingListMenu
            lists={lists}
            selectedId={activeListId}
            renderAnchor={(open) => <Appbar.Action icon="format-list-bulleted" color={theme.colors.onPrimary}
              accessibilityLabel={t('screens.shopping.switchList')} onPress={open} />}
            onChoose={chooseList}
            extraItems={[{title: t('screens.shopping.manageLists'), icon: 'cog-outline', onPress: manageLists}]} />
        ),
      });
    };
    applyHeaderOptions();
    return props.navigation.addListener('focus', () => {
      applyHeaderOptions();
      refresh();
    });
  }, [props.navigation, lists, activeList, activeListId, theme, refresh]);

  const change = (op: ShoppingOp) => activeListId !== null && dispatch(changeShoppingList(activeListId, op));

  const add = (name: string, spec: string | null, tile?: ShoppingTile) => {
    change({opId: newClientId(), type: 'ADD', itemId: newClientId(), name, spec,
      aisle: tile?.aisle ?? null, icon: tile?.icon ?? null});
    setTyped('');
  };

  /** What was typed, split into name and amount, placed like its tile when it names one. */
  const addTyped = () => {
    const {name, spec} = parseQuickAdd(typed, unitWords);
    if (name.length > 0) {
      add(name, spec, tileNamed(tiles, name));
    }
  };

  const tick = (item: ShoppingItem) => {
    change({opId: newClientId(), type: 'BUY', itemId: item.id});
    SnackbarUtil.show({
      message: t('screens.shopping.ticked', {name: item.name}),
      action: t('common.undo'),
      onAction: () => change({opId: newClientId(), type: 'RESTORE', itemId: item.id, spec: item.spec}),
    });
  };

  const restore = (item: ShoppingItem) => {
    change({opId: newClientId(), type: 'RESTORE', itemId: item.id});
    setTyped('');
  };

  const save = (item: ShoppingItem, changes: ItemEdit) => {
    if (changes.name !== undefined || changes.spec !== undefined || changes.aisle !== undefined) {
      change({opId: newClientId(), type: 'UPDATE', itemId: item.id, ...changes});
    }
  };

  const remove = (item: ShoppingItem) => {
    change({opId: newClientId(), type: 'DELETE', itemId: item.id});
    SnackbarUtil.show({message: t('screens.shopping.itemRemoved', {name: item.name})});
  };

  const stopAdding = () => {
    setAdding(false);
    setTyped('');
    Keyboard.dismiss();
  };

  return (
    <Surface style={CentralStyles.fullscreen}>
      <Searchbar
        style={styles.search}
        placeholder={t('screens.shopping.addPlaceholder')}
        icon={adding ? 'arrow-left' : 'plus'}
        onIconPress={adding ? stopAdding : () => setAdding(true)}
        value={typed}
        onFocus={() => setAdding(true)}
        onChangeText={setTyped}
        onSubmitEditing={addTyped} />
      {!isOnline && <Text variant="bodySmall" style={styles.hint}>{t('screens.shopping.offlineHint')}</Text>}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          refresh().finally(() => setRefreshing(false));
        }} />}>
        {adding ?
          <QuickAddPanel typed={typed} tiles={tiles} unitWords={unitWords} active={active} bought={bought} onAdd={add}
            onAddTyped={addTyped} onRestore={restore} /> :
          <>
            {active.length === 0 && <Text style={styles.hint}>{t('screens.shopping.empty')}</Text>}
            <TileGrid byAisle items={active} keyOf={(item) => item.id} renderTile={(item) => (
              <ShoppingItemTile name={item.name} spec={item.spec} icon={item.icon} aisle={item.aisle}
                onPress={() => tick(item)} onLongPress={() => setOpenItem(item)} />
            )} />
            {bought.length > 0 &&
              <>
                <Text variant="titleSmall" style={styles.recent}>{t('screens.shopping.recentlyBought')}</Text>
                <TileGrid items={bought} keyOf={(item) => item.id} renderTile={(item) => (
                  <ShoppingItemTile name={item.name} icon={item.icon} aisle={item.aisle} muted
                    onPress={() => restore(item)} onLongPress={() => setOpenItem(item)} />
                )} />
              </>}
          </>}
      </ScrollView>
      {openItem &&
        <ShoppingItemDialog
          item={openItem}
          onDismiss={() => setOpenItem(undefined)}
          onSave={(changes) => save(openItem, changes)}
          onRemove={() => remove(openItem)} />}
    </Surface>
  );
};

const styles = StyleSheet.create({
  search: {margin: 12, marginBottom: 4},
  content: {padding: 12, paddingBottom: 32},
  hint: {marginHorizontal: 12, marginVertical: 8},
  recent: {marginTop: 16, marginBottom: 8},
});
