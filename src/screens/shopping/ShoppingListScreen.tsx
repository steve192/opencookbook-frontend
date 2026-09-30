import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {Appbar, Surface, Text} from 'react-native-paper';
import {TileLook} from '../../components/shopping/FlyingTile';
import {ShoppingListMenu} from '../../components/shopping/ShoppingListMenu';
import {useTileFlights} from '../../components/shopping/useTileFlights';
import {ShoppingItem, ShoppingList, ShoppingTile} from '../../dao/RestAPI';
import {newClientId} from '../../helper/clientId';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {activeItems, recentlyBought, visibleItems} from '../../helper/shopping/listItems';
import {changeShoppingList, loadShoppingLists, ShoppingChange, syncShoppingList} from '../../helper/shopping/shoppingSync';
import {boughtKey, listKey, sheetKey, sourceKeyOf} from '../../helper/shopping/tileKeys';
import {TILE_AREA_PADDING} from '../../helper/shopping/tileLayout';
import {typedEntry} from '../../helper/shopping/tiles';
import {useListName} from '../../helper/shopping/useListName';
import {useShoppingVocabulary} from '../../helper/shopping/useShoppingVocabulary';
import {useStableCallback} from '../../helper/useStableCallback';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {shoppingListChosen} from '../../redux/features/shoppingSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {ItemTile} from './ItemTile';
import {QuickAddField} from './QuickAddField';
import {QuickAddSheet} from './QuickAddSheet';
import {ItemEdit, ShoppingItemDialog} from './ShoppingItemDialog';
import {TILE_LAYOUT, TileGrid} from './TileGrid';
import {useFollowNewest} from './useFollowNewest';
import {useQuickAdd} from './useQuickAdd';

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

  const [openItem, setOpenItem] = useState<ShoppingItem>();
  const [refreshing, setRefreshing] = useState(false);
  const quickAdd = useQuickAdd(props.navigation);
  const follow = useFollowNewest(quickAdd.adding, LIST_END_PADDING);
  const flights = useTileFlights();

  const activeList = lists.find((list) => list.id === activeListId);
  const nameOf = useListName();
  const items = useMemo(
      () => visibleItems(held), [held]);
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
    void dispatch(syncShoppingList(list.id));
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
      void refresh();
    });
  }, [props.navigation, lists, activeList, activeListId, theme, refresh]);

  const change = (op: ShoppingChange) => activeListId !== null && dispatch(changeShoppingList(activeListId, op));

  const addFrom = (sourceKey: string, look: TileLook, op: ShoppingChange) =>
    flights.launch(sheetKey(sourceKey), listKey(look.name), look, () => {
      change(op);
      quickAdd.next();
    }, follow.reveal);

  const add = (name: string, spec: string | null, tile: ShoppingTile | undefined, sourceKey: string) =>
    addFrom(sourceKey, {name, spec, icon: tile?.icon ?? null, aisle: tile?.aisle ?? 'OTHER'},
        {type: 'ADD', itemId: newClientId(), name, spec, aisle: tile?.aisle ?? null, icon: tile?.icon ?? null});

  const restoreFrom = (item: ShoppingItem, sourceKey: string) =>
    addFrom(sourceKey, lookOf(item), {type: 'RESTORE', itemId: item.id});

  const addTyped = () => {
    const entry = typedEntry(quickAdd.typed, unitWords, tiles, bought);
    if (entry) {
      void add(entry.name, entry.spec, entry.tile, sourceKeyOf(entry));
    }
  };

  const tick = (item: ShoppingItem) => {
    void flights.launch(listKey(item.name), boughtKey(item.name), lookOf(item),
        () => change({type: 'BUY', itemId: item.id}));
    SnackbarUtil.show({
      message: t('screens.shopping.ticked', {name: item.name}),
      action: t('common.undo'),
      onAction: () => restore(item, item.spec),
    });
  };

  // Without a spec, as bought again; undoing a tick keeps it.
  const restore = (item: ShoppingItem, spec?: string | null) =>
    flights.launch(boughtKey(item.name), listKey(item.name), lookOf(item),
        () => change({type: 'RESTORE', itemId: item.id, spec}));

  const onTick = useStableCallback(tick);
  const onRestore = useStableCallback((item: ShoppingItem) => restore(item));

  const save = (item: ShoppingItem, changes: ItemEdit) => {
    if (changes.name !== undefined || changes.spec !== undefined || changes.aisle !== undefined) {
      change({type: 'UPDATE', itemId: item.id, ...changes});
    }
  };

  const remove = (item: ShoppingItem) => {
    change({type: 'DELETE', itemId: item.id});
    SnackbarUtil.show({message: t('screens.shopping.itemRemoved', {name: item.name})});
  };

  return (
    <Surface style={CentralStyles.screen}>
      {!isOnline && <Text variant="bodySmall" style={styles.hint}>{t('screens.shopping.offlineHint')}</Text>}
      <View ref={follow.areaRef} style={styles.listArea} collapsable={false}>
        <ScrollView
          {...follow.listProps}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            void refresh().finally(() => setRefreshing(false));
          }} />}>
          {active.length === 0 && !quickAdd.adding && <Text style={styles.hint}>{t('screens.shopping.empty')}</Text>}
          <TileGrid byAisle={!quickAdd.adding} animated items={active} keyOf={(item) => item.id}
            still={(item) => flights.isMoving(listKey(item.name))}
            renderTile={(item) => (
              <ItemTile item={item} hidden={flights.isMoving(listKey(item.name))}
                viewRef={flights.register(listKey(item.name))} onPress={onTick} onLongPress={setOpenItem} />
            )} />
          {!quickAdd.adding &&
            <Animated.View layout={TILE_LAYOUT} entering={FadeIn} exiting={FadeOut}>
              {bought.length > 0 &&
                <Text variant="titleSmall" style={styles.recent}>{t('screens.shopping.recentlyBought')}</Text>}
              {/* Mounted while empty too, so the first tile ticked off already animates into it. */}
              <TileGrid animated items={bought} keyOf={(item) => item.id}
                still={(item) => flights.isMoving(boughtKey(item.name))}
                renderTile={(item) => (
                  <ItemTile item={item} muted hidden={flights.isMoving(boughtKey(item.name))}
                    viewRef={flights.register(boughtKey(item.name))} onPress={onRestore} onLongPress={setOpenItem} />
                )} />
            </Animated.View>}
        </ScrollView>
        {quickAdd.adding &&
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={t('common.done')}
            onPress={quickAdd.stop} />}
      </View>
      {quickAdd.adding &&
        <QuickAddSheet typed={quickAdd.typed} tiles={tiles} unitWords={unitWords} active={active} bought={bought}
          onAdd={add} onRestore={restoreFrom} registerSource={(key) => flights.register(sheetKey(key))} />}
      <QuickAddField inputRef={quickAdd.fieldRef} typed={quickAdd.typed} onType={quickAdd.setTyped}
        onFocus={quickAdd.start} onSubmit={addTyped} adding={quickAdd.adding} onDone={quickAdd.stop} />
      {flights.copies}
      {openItem &&
        <ShoppingItemDialog
          item={openItem}
          onDismiss={() => setOpenItem(undefined)}
          onSave={(changes) => save(openItem, changes)}
          onRemove={() => remove(openItem)} />}
    </Surface>
  );
};

const lookOf = (item: ShoppingItem): TileLook =>
  ({name: item.name, spec: item.spec, icon: item.icon, aisle: item.aisle});

const LIST_END_PADDING = 32;

const styles = StyleSheet.create({
  listArea: {flex: 1},
  content: {padding: TILE_AREA_PADDING, paddingBottom: LIST_END_PADDING},
  hint: {marginHorizontal: TILE_AREA_PADDING, marginVertical: 8},
  recent: {marginTop: 16, marginBottom: 8},
});
