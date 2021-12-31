import {MaterialIcons} from '@expo/vector-icons';
import {Layout, Text, useTheme} from '@ui-kitten/components';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, StyleSheet, View, ViewProps} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {Recipe, RecipeGroup} from '../dao/RestAPI';
import {fetchMyRecipeGroups, fetchMyRecipes} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {RecipeImageComponent} from './RecipeImageComponent';

interface Props {
    shownRecipeGroupId: number | undefined
    onRecipeClick: (recipe: Recipe) => void
    onRecipeGroupClick: (recipeGroup: RecipeGroup) => void
}
export const RecipeList = (props: Props) => {
  const myRecipes = useAppSelector((state) => state.recipes.recipes);
  const myRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
  const listRefreshing = useAppSelector((state) => state.recipes.pendingRequests > 0);

  const [componentWidth, setComponentWith] = useState<number>(1);

  const {t} = useTranslation('translation');
  const theme = useTheme();

  const dispatch = useAppDispatch();

  const refreshData = () => {
    dispatch(fetchMyRecipes());
    dispatch(fetchMyRecipeGroups());
  };
  useEffect(refreshData, []);

  const getShownItems = (): (RecipeGroup | Recipe)[] => {
    if (!props.shownRecipeGroupId) {
      return [...myRecipeGroups, ...myRecipes.filter((recipe) => recipe.recipeGroups.length === 0)];
    } else {
      return myRecipes.filter((recipe) => recipe.recipeGroups.filter((group) => group.id === props.shownRecipeGroupId).length > 0);
    }
  };

  const dataProvider = useMemo(() => {
    return new DataProvider((item1, item2) => {
      return item1.id !== item2.id;
    }).cloneWithRows(getShownItems());
  }, [myRecipes, myRecipeGroups]);

  const createRecipeListItem = (recipe: Recipe) => {
    return (
      <Pressable
        key={recipe.id}
        style={[styles.recipeCard]}
        onPress={() => props.onRecipeClick(recipe)}>
        <Layout style={{height: 180, borderRadius: 16, overflow: 'hidden'}}>
          <RecipeImageComponent
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

  const numberOfColumns = Math.ceil(componentWidth / 300);
  const _layoutProvider = LayoutUtil.getLayoutProvider(componentWidth, numberOfColumns);


  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        setComponentWith(event.nativeEvent.layout.width);
      }}>

      { getShownItems().length > 0 ?
      <RecyclerListView
        style={styles.container}
        layoutProvider={_layoutProvider}
        dataProvider={dataProvider}
        renderAheadOffset={1000}
        canChangeSize={true}
        // forceNonDeterministicRendering={true}
        rowRenderer={renderItem} /> :
      renderNoItemsNotice() }

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: '100%',
    // height: '100%',
    flex: 1,
  },
  contentContainer: {
    // paddingHorizontal: 8,
    // paddingVertical: 4,
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
        () => {
          return 'VSEL'; // Since we have just one view type
        },
        (type, dim, index) => {
          dim.width = componentWidth / numberOfColumns;// 200;
          dim.height = 246;
        },
    );
  }
}

