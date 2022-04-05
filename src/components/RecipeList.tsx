import {MaterialIcons} from '@expo/vector-icons';
import {Input, Layout, Text, useTheme} from '@ui-kitten/components';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, RefreshControl, StyleSheet, View, ViewProps} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {CrossIcon, SearchIcon} from '../assets/Icons';
import {Recipe, RecipeGroup} from '../dao/RestAPI';
import {fetchMyRecipeGroups, fetchMyRecipes} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';
import {RecipeImageComponent} from './RecipeImageComponent';
import fuzzy from 'fuzzy';

interface Props {
    shownRecipeGroupId: number | undefined
    onRecipeClick: (recipe: Recipe) => void
    onRecipeGroupClick: (recipeGroup: RecipeGroup) => void
}
export const RecipeList = (props: Props) => {
  const myRecipes = useAppSelector((state) => state.recipes.recipes);
  const myRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
  const listRefreshing = useAppSelector((state) => state.recipes.pendingRequests > 0);
  const [searchStringPendingInput, setSearchStringPendingInput] = useState('');
  const [searchString, setSearchString] = useState('');

  const [componentWidth, setComponentWith] = useState<number>(1);

  const {t} = useTranslation('translation');
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const searchDebounceTimer = useRef<NodeJS.Timeout>();

  const refreshData = () => {
    dispatch(fetchMyRecipes());
    dispatch(fetchMyRecipeGroups());

    // Clear the search debounce timer, to avoid state changes on unmounted component
    return () => searchDebounceTimer.current && clearTimeout(searchDebounceTimer.current);
  };
  useEffect(refreshData, []);

  const getShownItems = (includeGroupedRecipes=false): (RecipeGroup | Recipe)[] => {
    if (props.shownRecipeGroupId) {
      // Navigated in a group, return only group items
      return myRecipes.filter((recipe) => recipe.recipeGroups.filter((group) => group.id === props.shownRecipeGroupId).length > 0);
    } else if (includeGroupedRecipes) {
      // Return all recipes and groups (used in search mode)
      return [...myRecipeGroups, ...myRecipes];
    } else {
      // Only return recipes, not in a group and groups
      return [...myRecipeGroups, ...myRecipes.filter((recipe) => recipe.recipeGroups.length === 0)];
    }
  };

  const dataProvider = useMemo(() => {
    let shownItems: (Recipe|RecipeGroup)[] = [];
    if (searchString !== '') {
      shownItems = getShownItems(true);
      shownItems = fuzzy
          .filter(searchString, shownItems, {extract: (e) => e.title})
          .map((e) => e.original);
    } else {
      shownItems = getShownItems();
    }

    return new DataProvider((item1, item2) => {
      return item1.id !== item2.id;

      // Empty object as first item.
      // This is used for an initial offset due to the search input field
      // @ts-ignore
    }).cloneWithRows([{}].concat(shownItems));
  }, [myRecipes, myRecipeGroups, searchString]);

  const createRecipeListItem = (recipe: Recipe) => {
    return (
      <Pressable
        key={recipe.id}
        style={[styles.recipeCard]}
        onPress={() => props.onRecipeClick(recipe)}>
        <Layout style={{height: 180, borderRadius: 16, overflow: 'hidden'}}>
          <RecipeImageComponent
            useThumbnail={true}
            forceFitScaling={true}
            uuid={recipe.images.length > 0 ? recipe.images[0].uuid : undefined} />
        </Layout>
        {renderRecipeTitle(undefined, recipe.title)}
      </Pressable>
    );
  };
  const createRecipeGroupListItem = (recipeGroup: RecipeGroup) => {
    const firstFewGroupRecipes = myRecipes.filter((recipe) => recipe.recipeGroups.find((group) => group.id === recipeGroup.id)).splice(0, 4);
    return (
      <Pressable
        key={'rg'+recipeGroup.id}
        style={[
          styles.recipeCard,
          {
            flex: 1 / numberOfColumns,
            borderRadius: 16,
            minHeight: 240,
            overflow: 'hidden',
          }]}
        onPress={() => props.onRecipeGroupClick(recipeGroup)}>
        <Layout style={{flex: 1, height: '100%', flexWrap: 'wrap'}}>
          {firstFewGroupRecipes.map((recipe) =>
            <RecipeImageComponent
              blurredMode={true}
              key={recipe.id}
              forceFitScaling={true}
              uuid={recipe.images.length > 0 ? recipe.images[0].uuid : undefined} />,
          )}
        </Layout>
        <View style={{backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', width: '100%', height: '100%'}} >
          <Text
            category={'h4'}
            style={{
              padding: 16,
              fontWeight: 'bold',
              position: 'absolute',
              color: theme['text-alternate-color'],
            }}>
            {recipeGroup.title}
          </Text>
        </View>
      </Pressable>

    );
  };

  const renderItem = (type: string | number, data: Recipe | RecipeGroup): JSX.Element => {
    if (data.type === 'Recipe') {
      return createRecipeListItem(data as Recipe);
    } else if (data.type === 'RecipeGroup') {
      return createRecipeGroupListItem(data as RecipeGroup);
    }
    return <View></View>;
  };

  const renderRecipeTitle = (headerProps: ViewProps | undefined, title: string) => (
    <Text numberOfLines={2} style={{height: 60, padding: 10, fontWeight: 'bold'}} >
      {title}
    </Text>
  );

  const renderNoItemsNotice = () => (
    <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <MaterialIcons name="no-food" size={64} color={theme['text-disabled-color']} />
      <Text category="h4" style={{padding: 64, color: theme['text-disabled-color']}}>
        {t('screens.overview.noRecipesMessage')}
      </Text>
    </View>
  );


  const updateSearchString = (newValue: string) => {
    setSearchStringPendingInput(newValue);
    searchDebounceTimer.current && clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(()=>{
      // User has not entered anything for some time, start searching
      setSearchString(newValue);
    }, 500);
  };

  let numberOfColumns = Math.ceil(componentWidth / 300);
  numberOfColumns = numberOfColumns > 4 ? 4 : numberOfColumns;
  const _layoutProvider = LayoutUtil.getLayoutProvider(componentWidth, numberOfColumns);


  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        setComponentWith(event.nativeEvent.layout.width);
      }}>


      { getShownItems().length > 0 && numberOfColumns !== 0 && componentWidth > 10?
      <RecyclerListView
        style={{flex: 1}}
        layoutProvider={_layoutProvider}
        dataProvider={dataProvider}
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
        rowRenderer={renderItem} /> :
      renderNoItemsNotice() }

      <View style={[CentralStyles.contentContainer, styles.searchContainer]}>
        <Input
          value={searchStringPendingInput}
          onChangeText={updateSearchString}
          style={{flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center'}}
          placeholder={t('screens.overview.searchPlaceholder')}
          accessoryLeft={SearchIcon}
          accessoryRight={searchStringPendingInput ? <CrossIcon onPress={() => updateSearchString('')}/> : undefined}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: 'flex-start',
    flexDirection: 'column',
    flex: 1,
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
          return index === 0 ? 'first': 'normal'; // Since we have just one view type
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

