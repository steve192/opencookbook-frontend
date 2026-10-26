import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {skipToken} from '@reduxjs/toolkit/query';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, RefreshControl, SectionList, StyleSheet} from 'react-native';
import {List, Surface, Text} from 'react-native-paper';
import {useGetShoppingHistoryInfiniteQuery} from '../../api/endpoints/shopping';
import {AppScrollView} from '../../components/AppScrollView';
import {shoppingIconSide} from '../../components/listSides';
import {QueryFallback} from '../../components/QueryFallback';
import {historyDays, useHistoryTexts} from '../../helper/shopping/history';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useAppSelector} from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'ShoppingHistoryScreen'>;

// Who changed what on a list, newest first, loading older days as they come into view.
export const ShoppingHistoryScreen = ({route}: Props) => {
  const {t} = useTranslation('translation');
  const texts = useHistoryTexts();
  const list = useAppSelector((state) => state.shopping.lists.find((each) => each.id === route.params.listId));
  const history = useGetShoppingHistoryInfiniteQuery(list ?? skipToken);
  const days = useMemo(() => historyDays(history.data?.pages.flatMap((page) => page.events) ?? []), [history.data]);

  if (!history.data) {
    return <QueryFallback error={history.error} onRetry={history.refetch} />;
  }
  return (
    <Surface style={CentralStyles.screen}>
      <SectionList
        sections={days}
        keyExtractor={(event) => String(event.id)}
        renderScrollComponent={(props) => <AppScrollView {...props} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={CentralStyles.contentContainer}
        renderSectionHeader={({section}) => <List.Subheader>{texts.dayTitle(section.day)}</List.Subheader>}
        renderItem={({item: event}) => (
          <List.Item title={texts.title(event)} description={texts.doneBy(event)} descriptionNumberOfLines={3}
            left={shoppingIconSide(event.icon, event.aisle)} />
        )}
        ListEmptyComponent={<Text variant="bodyMedium" style={styles.empty}>{t('screens.shopping.history.empty')}</Text>}
        ListFooterComponent={history.isFetchingNextPage ? <ActivityIndicator style={styles.more} /> : null}
        onEndReached={() => {
          if (history.hasNextPage && !history.isFetchingNextPage) {
            void history.fetchNextPage();
          }
        }}
        refreshControl={<RefreshControl refreshing={history.isFetching && !history.isFetchingNextPage}
          onRefresh={() => void history.refetch()} />} />
    </Surface>
  );
};

const styles = StyleSheet.create({
  empty: {margin: 16},
  more: {margin: 16},
});
