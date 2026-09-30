import {MaterialIcons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {Badge, Surface, Text} from 'react-native-paper';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {useCookbookRecipes, useGetRecipeGroupsQuery} from '../api/endpoints/recipes';
import {Recipe, RecipeGroup} from '../api/types/recipes';
import {searchByTitle} from '../helper/titleSearch';
import {cookbookRows, ListRow, listRowHasChanged, RecipeGroupRow, RecipeRow} from '../helper/recipeListRows';
import {columnsFor, RECIPE_TILE_HEIGHT} from '../helper/recipeGrid';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {QueryFallback} from './QueryFallback';
import {RecipeImageComponent} from './RecipeImageComponent';
import {RECIPE_SEARCHBAR_SPACE, RecipeSearchbar} from './RecipeSearchbar';
import {RecipeTile} from './RecipeTile';

const NO_GROUPS: RecipeGroup[] = [];

interface Props {
  /** A household's cookbook instead of your own: it says whose each recipe is, and has no groups. */
  householdId?: string
  shownRecipeGroupId: number | undefined
  onRecipeClick: (recipe: Recipe) => void
  onRecipeGroupClick: (recipeGroup: RecipeGroup) => void
  onMultiSelectionModeToggled?: (recipe: Recipe) => void
  multiSelectionModeActive?: boolean
  selectedRecipes?: Set<number>
  onRecipeSelected?: (selectedRecipe: number) => void
}
export const RecipeList = (props: Props) => {
  const ownCookbook = props.householdId === undefined;
  const recipes = useCookbookRecipes(props.householdId);
  // Groups are their owner's own, so a household cookbook shows none.
  const recipeGroups = useGetRecipeGroupsQuery(undefined, {skip: !ownCookbook});
  const cookbookRecipes = recipes.data;
  const cookbookGroups = ownCookbook ? recipeGroups.data ?? NO_GROUPS : NO_GROUPS;
  const listRefreshing = recipes.isFetching || recipeGroups.isFetching;
  const [searchString, setSearchString] = useState('');

  const [componentWidth, setComponentWidth] = useState<number>(1);

  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const refreshData = () => {
    void recipes.refetch();
    if (ownCookbook) {
      void recipeGroups.refetch();
    }
  };

  const rowsOf = (searching: boolean): ListRow[] =>
    cookbookRows(cookbookRecipes ?? [], cookbookGroups, props.shownRecipeGroupId, searching);

  const topLevelRows = useMemo(
      () => rowsOf(false),
      [cookbookRecipes, cookbookGroups, props.shownRecipeGroupId]);

  const shownItems = useMemo(
      () => searchString === '' ? topLevelRows : searchByTitle(rowsOf(true), searchString),
      [topLevelRows, cookbookRecipes, cookbookGroups, searchString, props.shownRecipeGroupId]);

  const dataProvider = useMemo(() =>
    // Empty object as first item.
    // This is used for an initial offset due to the search input field
    // @ts-ignore
    new DataProvider(listRowHasChanged).cloneWithRows([{}].concat(shownItems)),
  [shownItems]);

  // Which recipes are selected is not part of the row data, so rowHasChanged (which only
  // compares ids) cannot see it. RecyclerListView repaints its rows for exactly this case
  // when the extended state changes identity.
  const selectionState = useMemo(
      () => ({multiSelectionModeActive: props.multiSelectionModeActive, selectedRecipes: props.selectedRecipes}),
      [props.multiSelectionModeActive, props.selectedRecipes],
  );

  const onRecipeClick = (recipe: Recipe) => {
    if (props.multiSelectionModeActive) {
      props.onRecipeSelected?.(recipe.id!);
      return;
    }

    props.onRecipeClick(recipe);
  };

  const ownerOf = (recipe: RecipeRow) => recipe.mine ?
    t('screens.households.byYou') :
    t('screens.households.ownedBy', {name: recipe.ownerDisplayName});

  const createRecipeListItem = (recipe: RecipeRow) => (
    <RecipeTile
      key={recipe.id}
      title={recipe.title}
      coverImageUuid={recipe.coverImageUuid}
      subtitle={ownCookbook ? undefined : ownerOf(recipe)}
      onPress={() => onRecipeClick(recipe)}
      onLongPress={() => props.onMultiSelectionModeToggled?.(recipe)}
      selectable={props.multiSelectionModeActive}
      selected={props.multiSelectionModeActive && props.selectedRecipes?.has(recipe.id!)} />
  );
  // Show one blurred cover image per group plus a count badge instead of rendering
  // up to four blurred thumbnails. On lower-end Android devices the old layout
  // queued 4 base64 image fetches and 4 simultaneous Image#blurRadius effects per
  // group card, which dominated scroll cost on the "My recipes" list.
  const createRecipeGroupListItem = (recipeGroup: RecipeGroupRow) => {
    return (
      <Pressable
        testID='recipeGroupListItem'
        key={'rg' + recipeGroup.id}
        style={[
          styles.recipeCard,
          {
            flex: 1 / numberOfColumns,
            borderRadius: 16,
            minHeight: 240,
            overflow: 'hidden',
          }]}
        onPress={() => props.onRecipeGroupClick(recipeGroup)}>
        <Surface style={{flex: 1, height: '100%'}}>
          <RecipeImageComponent
            blurredMode={true}
            forceFitScaling={true}
            useThumbnail={true}
            uuid={recipeGroup.coverImageUuid} />
        </Surface>
        <View style={styles.groupOverlay}>
          <Text
            variant="headlineSmall"
            style={{
              padding: 16,
              fontWeight: 'bold',
              color: theme.colors.onPrimary,
              flex: 1,
            }}>
            {recipeGroup.title}
          </Text>
          {recipeGroup.recipeCount > 0 &&
            <Badge
              // Paper defaults badges to the error color, which reads as a warning on a
              // plain "how many recipes are in here" counter. Force the app accent instead.
              style={[styles.groupCountBadge, {backgroundColor: theme.colors.primary, color: theme.colors.onPrimary}]}>
              {recipeGroup.recipeCount}
            </Badge>
          }
        </View>
      </Pressable>
    );
  };

  const renderItem = (type: string | number, data: ListRow): React.JSX.Element => {
    if (data.type === 'Recipe') {
      return createRecipeListItem(data);
    } else if (data.type === 'RecipeGroup') {
      return createRecipeGroupListItem(data);
    }
    return <View></View>;
  };

  const renderNoItemsNotice = () => (
    <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, position: 'absolute'}}>
      <MaterialIcons name="no-food" size={64} color={theme.colors.onSurfaceDisabled} />
      <Text variant="headlineSmall" style={{padding: 64, color: theme.colors.onSurfaceDisabled}}>
        {ownCookbook ? t('screens.overview.noRecipesMessage') : t('screens.households.recipeCount', {count: 0})}
      </Text>
    </View>
  );


  const numberOfColumns = columnsFor(componentWidth);

  // Handed a layout provider it has not seen before, RecyclerListView rebuilds its layout
  // and re-anchors the scroll offset to the top edge of the first visible row. Building one
  // per render therefore snapped the list to a row boundary on every state change, which
  // showed up as a jump when entering multi selection mode while scrolled mid row.
  const layoutProvider = useMemo(
      () => LayoutUtil.getLayoutProvider(componentWidth, numberOfColumns),
      [componentWidth, numberOfColumns],
  );

  // The notice is about a cookbook without recipes, not about a search matching nothing,
  // so it deliberately looks past the search term.
  const hasItems = topLevelRows.length > 0;
  const showNoItemsNotice = !(hasItems && numberOfColumns !== 0 && componentWidth > 10);

  if (!cookbookRecipes) {
    return <QueryFallback error={recipes.error} onRetry={recipes.refetch} />;
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        event.nativeEvent.layout.width > 0 && setComponentWidth(event.nativeEvent.layout.width);
      }}>


      <RecyclerListView
        style={{flex: 1}}
        suppressBoundedSizeException={true}
        layoutProvider={layoutProvider}
        dataProvider={dataProvider}
        extendedState={selectionState}
        renderAheadOffset={1000}
        canChangeSize={true}
        // applyWindowCorrection={(offsetX, offsetY, windowCorrection) => ({
        //   windowShift: 800,
        // })}
        scrollViewProps={{
          refreshControl: (
            <RefreshControl
              refreshing={listRefreshing}
              onRefresh={() => refreshData()}
            />
          ),
        }}
        // forceNonDeterministicRendering={true}
        rowRenderer={renderItem} />

      { showNoItemsNotice && renderNoItemsNotice()}

      <RecipeSearchbar onSearch={setSearchString} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: 'flex-start',
    flexDirection: 'column',
    flex: 1,
    minHeight: 1,
    minWidth: 1,
  },
  list: {
    flex: 1,
  },
  recipeCard: {
    ...CentralStyles.recipeCardFrame,
    margin: 3,
    flex: 1,
  },
  recipeGroupCard: {
    margin: 1,
    flex: 1,
  },
  groupOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  groupCountBadge: {
    margin: 12,
  },
  cardcontainer: {
    flex: 1,
    flexDirection: 'row',
  },
  containerImage: {
    flex: 1,
    width: undefined,
    height: 100,
  },


});


class LayoutUtil {
  static getLayoutProvider(componentWidth: number, numberOfColumns: number) {
    return new LayoutProvider(
        (index) => {
          return index === 0 ? 'first' : 'normal'; // Since we have just one view type
        },
        (type, dim, index) => {
          if (type === 'first') {
            dim.width = componentWidth;
            dim.height = RECIPE_SEARCHBAR_SPACE;
            return;
          }
          dim.width = componentWidth / numberOfColumns;
          dim.height = RECIPE_TILE_HEIGHT;
        },
    );
  }
}

