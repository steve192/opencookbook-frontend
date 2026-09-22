import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {RecipeSearchbar} from '../../components/RecipeSearchbar';
import {RecipeTile} from '../../components/RecipeTile';
import RestAPI, {HouseholdRecipe} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {columnsFor, columnWidth} from '../../helper/recipeGrid';
import CentralStyles from '../../styles/CentralStyles';

interface Props {
  householdId: string;
  onRecipeClick: (recipe: HouseholdRecipe) => void;
}

/**
 * A household's cookbook, loaded page by page as recipe summaries and searched on the server.
 *
 * @param {Props} props which household to show
 * @return {JSX.Element} the shared cookbook
 */
export const HouseholdCookbookList = (props: Props) => {
  const {t} = useTranslation('translation');
  const [recipes, setRecipes] = useState<HouseholdRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [columns, setColumns] = useState(1);
  const [search, setSearch] = useState('');
  // Answers to earlier searches can arrive after later ones; only the latest request may land.
  const latestRequest = useRef(0);

  const loadPage = useCallback((page: number) => {
    const request = ++latestRequest.current;
    setLoading(true);
    RestAPI.getHouseholdRecipes(props.householdId, page, search)
        .then((loaded) => {
          if (request !== latestRequest.current) {
            return;
          }
          setRecipes((existing) => page === 0 ? loaded.recipes : [...existing, ...loaded.recipes]);
          setNextPage(page + 1);
          setHasMore(!loaded.last);
        })
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error,
            'screens.households.loadFailed'))}))
        .finally(() => {
          if (request === latestRequest.current) {
            setLoading(false);
          }
        });
  }, [props.householdId, search, t]);

  const load = useCallback(() => loadPage(0), [loadPage]);

  useEffect(load, [load]);

  return (
    <View
      style={CentralStyles.fullscreen}
      onLayout={(event) => setColumns(columnsFor(event.nativeEvent.layout.width))}>
      <View style={CentralStyles.contentContainer}>
        <RecipeSearchbar onSearch={setSearch} />
      </View>

      {loading && recipes.length === 0 ?
        <ActivityIndicator style={CentralStyles.elementSpacing} /> :
        <FlatList
          // FlatList rebuilds its layout from scratch when the column count changes, which it only
          // notices through the key.
          key={columns}
          numColumns={columns}
          data={recipes}
          keyExtractor={(recipe) => String(recipe.id)}
          onRefresh={load}
          refreshing={loading && recipes.length === 0}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !loading) {
              loadPage(nextPage);
            }
          }}
          ListFooterComponent={loading && recipes.length > 0 ?
            <ActivityIndicator style={CentralStyles.elementSpacing} /> :
            null}
          // Like your own cookbook, a search that matches nothing shows nothing.
          ListEmptyComponent={search === '' ?
            <Text style={CentralStyles.elementSpacing}>
              {t('screens.households.recipeCount', {count: 0})}
            </Text> :
            null}
          renderItem={({item}) => (
            <View style={{width: columnWidth(columns)}}>
              <RecipeTile
                testID="householdRecipeListItem"
                title={item.title}
                coverImageUuid={item.titleImageUuid}
                subtitle={item.mine ?
                  t('screens.households.byYou') :
                  t('screens.households.ownedBy', {name: item.ownerDisplayName})}
                onPress={() => props.onRecipeClick(item)} />
            </View>
          )} />
      }
    </View>
  );
};
