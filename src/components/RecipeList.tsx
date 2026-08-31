import {MaterialIcons} from '@expo/vector-icons';
import fuzzy from 'fuzzy';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, RefreshControl, StyleProp, StyleSheet, View, ViewProps, ViewStyle} from 'react-native';
import {Badge, Headline, RadioButton, Searchbar, Surface, Text} from 'react-native-paper';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {Recipe, RecipeGroup} from '../dao/RestAPI';
import {fetchMyRecipeGroups, fetchMyRecipes} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {ListRow, listRowHasChanged, RecipeGroupRow, RecipeRow, toRecipeGroupRow, toRecipeRow} from '../helper/recipeListRows';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {RecipeImageComponent} from './RecipeImageComponent';

interface Props {
  shownRecipeGroupId: number | undefined
  onRecipeClick: (recipe: Recipe) => void
  onRecipeGroupClick: (recipeGroup: RecipeGroup) => void
  onMultiSelectionModeToggled?: (recipe: Recipe) => void
  multiSelectionModeActive?: boolean
  selectedRecipes?: Set<number>
  onRecipeSelected?: (selectedRecipe: number) => void
}
export const RecipeList = (props: Props) => {
  const myRecipes = useAppSelector((state) => state.recipes.recipes);
  const myRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
  const listRefreshing = useAppSelector((state) => state.recipes.pendingRequests > 0);
  const [searchStringPendingInput, setSearchStringPendingInput] = useState('');
  const [searchString, setSearchString] = useState('');

  const [componentWidth, setComponentWith] = useState<number>(1);

  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const dispatch = useAppDispatch();
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const refreshData = () => {
    dispatch(fetchMyRecipes());
    dispatch(fetchMyRecipeGroups());

    // Clear the search debounce timer, to avoid state changes on unmounted component
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  };
  useEffect(refreshData, []);

  const getShownItems = (includeGroupedRecipes = false): ListRow[] => {
    const groupRows = () => myRecipeGroups.map((group) => toRecipeGroupRow(group, myRecipes));

    if (props.shownRecipeGroupId) {
      // Navigated in a group, return only group items
      return myRecipes
          .filter((recipe) => recipe.recipeGroups.filter((group) => group.id === props.shownRecipeGroupId).length > 0)
          .map(toRecipeRow);
    } else if (includeGroupedRecipes) {
      // Return all recipes and groups (used in search mode)
      return [...groupRows(), ...myRecipes.map(toRecipeRow)];
    } else {
      // Only return recipes, not in a group and groups
      return [...groupRows(), ...myRecipes.filter((recipe) => recipe.recipeGroups.length === 0).map(toRecipeRow)];
    }
  };

  const shownItems = useMemo(() => {
    if (searchString === '') {
      return getShownItems();
    }
    return fuzzy
        .filter(searchString, getShownItems(true), {extract: (item) => item.title})
        .map((match) => match.original);
  }, [myRecipes, myRecipeGroups, searchString, props.shownRecipeGroupId]);

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

  const createRecipeListItem = (recipe: RecipeRow) => {
    const cardIsSelected = props.multiSelectionModeActive && props.selectedRecipes && props.selectedRecipes.has(recipe.id!);
    const cardStyles: StyleProp<ViewStyle> = [styles.recipeCard];
    if (cardIsSelected) {
      cardStyles.push({backgroundColor: theme.colors.primary});
    }
    return (
      <Pressable
        testID='recipeListItem'
        key={recipe.id}
        style={cardStyles}
        onPress={() => onRecipeClick(recipe)}
        onLongPress={() => props.onMultiSelectionModeToggled?.(recipe)}>

        <Surface style={{height: 180, borderRadius: 16, overflow: 'hidden'}}>
          <RecipeImageComponent
            useThumbnail={true}
            forceFitScaling={true}
            uuid={recipe.coverImageUuid} />
        </Surface>
        {renderRecipeTitle(undefined, recipe.title)}
        {props.multiSelectionModeActive && <View style={{position: 'absolute'}}>
          <RadioButton
            value=''
            color={theme.colors.primary}
            uncheckedColor={theme.colors.primary}
            status={cardIsSelected ? 'checked': 'unchecked'}
            onPress={() => onRecipeClick(recipe)}/>
        </View>}
      </Pressable>
    );
  };
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
          <Headline
            style={{
              padding: 16,
              fontWeight: 'bold',
              color: theme.colors.onPrimary,
              flex: 1,
            }}>
            {recipeGroup.title}
          </Headline>
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

  const renderRecipeTitle = (headerProps: ViewProps | undefined, title: string) => (
    <Text numberOfLines={2} style={{height: 60, padding: 10, fontWeight: 'bold'}} >
      {title}
    </Text>
  );

  const renderNoItemsNotice = () => (
    <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, position: 'absolute'}}>
      <MaterialIcons name="no-food" size={64} color={theme.colors.onSurfaceDisabled} />
      <Headline style={{padding: 64, color: theme.colors.onSurfaceDisabled}}>
        {t('screens.overview.noRecipesMessage')}
      </Headline>
    </View>
  );


  const updateSearchString = (newValue: string) => {
    setSearchStringPendingInput(newValue);
    searchDebounceTimer.current && clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      // User has not entered anything for some time, start searching
      setSearchString(newValue);
    }, 500);
  };

  const numberOfColumns = Math.min(4, Math.ceil(componentWidth / 300));

  // Handed a layout provider it has not seen before, RecyclerListView rebuilds its layout
  // and re-anchors the scroll offset to the top edge of the first visible row. Building one
  // per render therefore snapped the list to a row boundary on every state change, which
  // showed up as a jump when entering multi selection mode while scrolled mid row.
  const layoutProvider = useMemo(
      () => LayoutUtil.getLayoutProvider(componentWidth, numberOfColumns),
      [componentWidth, numberOfColumns],
  );

  // The notice is about owning no recipes at all, not about a search matching nothing,
  // so it deliberately looks past the search term.
  const hasItems = useMemo(
      () => getShownItems().length > 0,
      [myRecipes, myRecipeGroups, props.shownRecipeGroupId],
  );
  const showNoItemsNotice = !(hasItems && numberOfColumns !== 0 && componentWidth > 10);

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        event.nativeEvent.layout.width > 0 && setComponentWith(event.nativeEvent.layout.width);
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

      <View style={[CentralStyles.contentContainer, styles.searchContainer]}>
        <Searchbar
          value={searchStringPendingInput}
          onChangeText={updateSearchString}
          style={{flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center'}}
          placeholder={t('screens.overview.searchPlaceholder')} />
      </View>
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
  searchContainer: {
    position: 'absolute',
    top: 0,
    height: 100,
  },
  recipeCard: {
    margin: 3,
    borderColor: 'rgba(0,0,0,0.09)',
    borderRadius: 16,
    borderWidth: 1,
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
            dim.height = 100; // Height of search bar
            return;
          }
          dim.width = componentWidth / numberOfColumns;
          dim.height = 246;
        },
    );
  }
}

