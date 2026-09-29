import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {Button, List, Surface} from 'react-native-paper';
import {usePlanTarget} from '../../components/PlanTargetDialog';
import {actionsSide, iconSide, SideAction} from '../../components/listSides';
import {ScreenFooter} from '../../components/ScreenFooter';
import RestAPI, {ShoppingList} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {listIcon} from '../../helper/shopping/lists';
import {loadShoppingLists} from '../../helper/shopping/shoppingSync';
import {useListName} from '../../helper/shopping/useListName';
import {TextPromptUtil} from '../../helper/TextPrompt';
import {useOnlineGuard} from '../../helper/useOnlineGuard';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';
import {useHouseholds} from '../households/useHouseholds';

type Props = NativeStackScreenProps<MainNavigationProps, 'ShoppingListsScreen'>;

const NAME_MAX_LENGTH = 64;

// Your lists and your households': start one, rename one, or delete one that is not a default list.
export const ShoppingListsScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const requireOnline = useOnlineGuard();
  const lists = useAppSelector((state) => state.shopping.lists);
  const {households} = useHouseholds();
  const scope = usePlanTarget(households);
  const nameOf = useListName();

  useEffect(() => {
    dispatch(loadShoppingLists()).catch(() => undefined);
  }, []);

  const run = (action: () => Promise<unknown>) => {
    if (!requireOnline()) {
      return;
    }
    action()
        .then(() => dispatch(loadShoppingLists()))
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  const askName = (title: string, initialValue: string, onConfirm: (name: string) => void) =>
    TextPromptUtil.show({title, label: t('screens.shopping.listName'), initialValue, maxLength: NAME_MAX_LENGTH,
      confirm: t('common.save'), cancel: t('common.cancel'), onConfirm});

  const create = (householdId: string | undefined) =>
    askName(t('screens.shopping.newList'), '', (name) =>
      run(() => RestAPI.createShoppingList(name, householdId ?? null)));

  const rename = (list: ShoppingList) =>
    askName(t('screens.shopping.rename'), nameOf(list), (name) => run(() => RestAPI.renameShoppingList(list, name)));

  const remove = (list: ShoppingList) => PromptUtil.show({
    title: t('screens.shopping.deleteList'),
    message: t('screens.shopping.deleteListMessage', {name: nameOf(list)}),
    confirm: t('common.delete'),
    cancel: t('common.cancel'),
    destructive: true,
    onConfirm: () => run(() => RestAPI.deleteShoppingList(list)),
  });

  // A default list can be renamed but never deleted.
  const actionsOf = (list: ShoppingList): SideAction[] => [
    {icon: 'pencil-outline', label: t('screens.shopping.rename'), onPress: () => rename(list)},
    ...(list.defaultList ? [] :
      [{icon: 'delete-outline', label: t('screens.shopping.deleteList'), onPress: () => remove(list)}]),
  ];

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView>
        {lists.map((list) => (
          <List.Item
            key={list.id}
            title={nameOf(list)}
            description={list.householdName ?? undefined}
            left={iconSide(listIcon(list))}
            right={actionsSide(actionsOf(list))} />
        ))}
      </ScrollView>
      <ScreenFooter>
        <Button key="new" mode="contained" icon="plus" onPress={() => scope.choose(t('screens.shopping.whoseList'), create)}>
          {t('screens.shopping.newList')}
        </Button>
      </ScreenFooter>
      {scope.dialog}
    </Surface>
  );
};
