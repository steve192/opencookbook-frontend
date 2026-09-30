import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {Button, List, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {ScreenFooter} from '../../components/ScreenFooter';
import {SectionTitle} from '../../components/SectionTitle';
import {ShoppingListMenu} from '../../components/shopping/ShoppingListMenu';
import {LoadingScreen} from '../../components/LoadingScreen';
import {
  useCreateBringExportOfLinesMutation, useGetImportPreviewQuery, useImportToShoppingListMutation,
} from '../../api/endpoints/shopping';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {openBringImport} from '../../helper/bringExport';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {bringLine, MealChoice, sheetLines} from '../../helper/shopping/importLines';
import {importRequest, initialChoices, isShoppedFor, isTicked, Ticks} from '../../helper/shopping/importSheet';
import {defaultListFor} from '../../helper/shopping/lists';
import {activeItems, visibleItems} from '../../helper/shopping/listItems';
import {nameKey} from '../../helper/shopping/names';
import {loadShoppingLists, syncShoppingList} from '../../helper/shopping/shoppingSync';
import {useListName} from '../../helper/shopping/useListName';
import {useShoppingProvider} from '../../helper/shopping/useShoppingProvider';
import {useShoppingVocabulary} from '../../helper/shopping/useShoppingVocabulary';
import {formatDayAndMonth, toDayKey} from '../../helper/weekplan';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import {shoppingListChosen} from '../../redux/features/shoppingSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';
import {AisleSections} from './AisleSections';
import {MealChoiceRow} from './import/MealChoiceRow';
import {SheetLineRow} from './import/SheetLineRow';

type Props = NativeStackScreenProps<MainNavigationProps, 'ShoppingImportScreen'>;

// Meals of a week or one recipe, their ingredients as a checklist, and where they go.
export const ShoppingImportScreen = ({route, navigation}: Props) => {
  const target = route.params;
  const {t, i18n} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const {provider} = useShoppingProvider();
  const lists = useAppSelector((state) => state.shopping.lists);
  const sync = useAppSelector((state) => state.shopping.sync);
  const {unitWords} = useShoppingVocabulary();
  const online = useIsOnline();

  const today = useMemo(() => toDayKey(new XDate().clearTime()), []);
  const householdId = target.kind === 'week' ? target.householdId : undefined;
  // Days already eaten are left out only while the week is still going; a past week is shopped whole.
  const onlyFromToday = target.kind === 'week' && target.from <= today && today <= target.to;

  const [choices, setChoices] = useState<MealChoice[]>();
  const [ticks, setTicks] = useState<Ticks>({});
  const [targetListId, setTargetListId] = useState<number>();
  const [showEarlier, setShowEarlier] = useState(false);
  const [sending, setSending] = useState(false);
  const preview = useGetImportPreviewQuery(target);
  const [createBringExportOfLines] = useCreateBringExportOfLinesMutation();
  const [importToShoppingList] = useImportToShoppingListMutation();

  useEffect(() => {
    if (preview.data && !choices) {
      setChoices(initialChoices(preview.data, today, {
        onlyFromToday, servings: target.kind === 'recipe' ? target.servings : undefined,
      }));
    }
  }, [preview.data]);

  useEffect(() => {
    if (preview.error) {
      SnackbarUtil.show({message: t(errorMessageKey(preview.error, 'screens.shopping.import.loadFailed'))});
      navigation.goBack();
    }
  }, [preview.error]);

  useEffect(() => {
    if (provider === 'COOKPAL') {
      dispatch(loadShoppingLists()).catch(() => undefined);
    }
  }, [provider]);

  useEffect(() => {
    if (targetListId === undefined) {
      setTargetListId(defaultListFor(lists, householdId)?.id);
    }
  }, [lists]);

  const lines = useMemo(() => sheetLines(choices ?? [], i18n.language, unitWords),
      [choices, i18n.language, unitWords]);
  const tickedLines = lines.filter((line) => isTicked(line, ticks));
  const targetList = lists.find((list) => list.id === targetListId);
  const nameOf = useListName();

  // What the target list already holds, so a line can say so.
  const onTargetList = useMemo(() => {
    const held = targetListId === undefined ? undefined : sync[targetListId];
    const items = activeItems(visibleItems(held));
    return new Map(items.map((item) => [nameKey(item.name), item.spec]));
  }, [sync, targetListId]);

  const earlier = (choices ?? []).filter((choice) => onlyFromToday && choice.meal.date !== null && choice.meal.date < today);
  const ahead = (choices ?? []).filter((choice) => !earlier.includes(choice));

  const changeChoice = (changed: MealChoice) =>
    setChoices((current) => current?.map((choice) => choice.meal.entryId === changed.meal.entryId ? changed : choice));

  const toggle = (key: string, ticked: boolean) => setTicks((current) => ({...current, [key]: !ticked}));

  const bringTitle = () => target.kind === 'week' ?
    t('screens.shopping.import.weekTitle', {date: formatDayAndMonth(new XDate(target.from), i18n.language)}) :
    (choices?.[0]?.meal.title ?? '');

  const send = async () => {
    const request = importRequest(lines, ticks);
    setSending(true);
    try {
      if (provider === 'BRING') {
        const servings = choices?.find((choice) => choice.included && isShoppedFor(choice.meal))?.servings ?? 1;
        await openBringImport(await createBringExportOfLines({title: bringTitle(), servings,
          lines: tickedLines.map(bringLine), shown: request.shown}).unwrap());
      } else if (targetList) {
        await importToShoppingList({list: targetList, lines: request.lines, shown: request.shown}).unwrap();
        dispatch(shoppingListChosen(targetList.id));
        void dispatch(syncShoppingList(targetList.id));
        SnackbarUtil.show({message: t('screens.shopping.import.added',
            {count: request.lines.length, list: nameOf(targetList)})});
      }
      navigation.goBack();
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'screens.shopping.import.failed'))});
    } finally {
      setSending(false);
    }
  };

  if (!choices) {
    return <LoadingScreen />;
  }

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle>{t('screens.shopping.import.meals')}</SectionTitle>
        {choices.length === 0 && <Text>{t('screens.shopping.import.noMeals')}</Text>}
        {earlier.length > 0 &&
          <List.Accordion
            title={t('screens.shopping.import.earlierDays', {count: earlier.length})}
            expanded={showEarlier}
            onPress={() => setShowEarlier(!showEarlier)}>
            {earlier.map((choice) => <MealChoiceRow key={choice.meal.entryId} choice={choice} onChange={changeChoice} />)}
          </List.Accordion>}
        {ahead.map((choice) => <MealChoiceRow key={choice.meal.entryId} choice={choice} onChange={changeChoice} />)}

        {lines.length > 0 && <SectionTitle>{t('screens.shopping.import.ingredients')}</SectionTitle>}
        <AisleSections items={lines} renderItems={(aisleLines) => aisleLines.map((line) => {
          const ticked = isTicked(line, ticks);
          return (
            <SheetLineRow
              key={line.key}
              line={line}
              ticked={ticked}
              onList={provider === 'COOKPAL' && onTargetList.has(nameKey(line.name)) ?
                onTargetList.get(nameKey(line.name)) : undefined}
              onToggle={() => toggle(line.key, ticked)} />
          );
        })} />
      </ScrollView>
      <ScreenFooter>
        {provider === 'COOKPAL' && lists.length > 1 &&
          <ShoppingListMenu
            key="target"
            lists={lists}
            selectedId={targetListId}
            renderAnchor={(open) => (
              <Button mode="outlined" icon="format-list-bulleted" onPress={open}>
                {targetList ? nameOf(targetList) : t('screens.shopping.import.target')}
              </Button>
            )}
            onChoose={(list) => setTargetListId(list.id)} />}
        <Button
          key="send"
          mode="contained"
          icon={provider === 'BRING' ? 'send' : 'cart-plus'}
          loading={sending}
          disabled={!online || sending || tickedLines.length === 0 || (provider === 'COOKPAL' && !targetList)}
          onPress={send}>
          {provider === 'BRING' ?
            t('screens.shopping.import.sendToBring', {count: tickedLines.length}) :
            t('screens.shopping.import.add', {count: tickedLines.length})}
        </Button>
      </ScreenFooter>
    </Surface>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16, paddingBottom: 24},
});
