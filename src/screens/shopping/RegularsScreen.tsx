import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {List, Text} from 'react-native-paper';
import {useGetShoppingRegularsQuery, useSetRegularMutedMutation} from '../../api/endpoints/shopping';
import {ShoppingList, ShoppingRegular} from '../../api/types/shopping';
import {CustomCard} from '../../components/CustomCard';
import {shoppingIconSide, switchSide} from '../../components/listSides';
import {PageFrame} from '../../components/PageFrame';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {useRhythmTexts} from '../../helper/shopping/rhythmTexts';
import {useListName} from '../../helper/shopping/useListName';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import {useAppSelector} from '../../redux/hooks';
import {SettingsHint} from '../settings/SettingsHint';

type Props = NativeStackScreenProps<MainNavigationProps, 'RegularsScreen'>;

// What each list learned it buys regularly, and whether it may suggest it.
export const RegularsScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  const lists = useAppSelector((state) => state.shopping.lists);
  return (
    <PageFrame>
      <SettingsHint>{`${t('screens.shopping.regulars.subtitle')} ${t('screens.shopping.regulars.howItLearns')}`}</SettingsHint>
      {lists.map((list) => <ListRegulars key={list.id} list={list} />)}
    </PageFrame>
  );
};

const ListRegulars = ({list}: {list: ShoppingList}) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const nameOf = useListName();
  const texts = useRhythmTexts();
  const {data: regulars} = useGetShoppingRegularsQuery(list);
  const [setRegularMuted] = useSetRegularMutedMutation();

  const suggest = (regular: ShoppingRegular, suggested: boolean) => {
    setRegularMuted({list, regular, muted: !suggested}).unwrap()
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  if (!regulars?.length) {
    return null;
  }
  return (
    <CustomCard>
      <Text variant="titleMedium">{nameOf(list)}</Text>
      {regulars.map((regular) => (
        <List.Item
          key={regular.id}
          title={regular.name}
          description={[regular.everyDays && texts.every(regular.everyDays),
            regular.lastBoughtAt && texts.lastBought(regular.lastBoughtAt)].filter(Boolean).join('\n')}
          descriptionNumberOfLines={2}
          left={shoppingIconSide(regular.icon, regular.aisle)}
          right={switchSide(!regular.muted, (suggested) => suggest(regular, suggested),
              t('screens.shopping.regulars.suggest', {name: regular.name}), !online)} />
      ))}
    </CustomCard>
  );
};
