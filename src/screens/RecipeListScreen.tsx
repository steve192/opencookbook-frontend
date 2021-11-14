import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Card, Layout, List, Text, useTheme } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo, Pressable, StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { FloatingAction, IActionProps } from 'react-native-floating-action';
import { FolderIcon } from '../assets/Icons';
import { RecipeImageComponent } from '../components/RecipeImageComponent';
import RestAPI, { Recipe, RecipeGroup } from '../dao/RestAPI';
import { MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation } from '../navigation/NavigationRoutes';


type Props = CompositeScreenProps<

  StackScreenProps<RecipeScreenNavigation, "RecipeListDetailScreen">,
  CompositeScreenProps<
    StackScreenProps<MainNavigationProps, "OverviewScreen">,
    BottomTabScreenProps<OverviewNavigationProps, "RecipesListScreen">
  >
>;


const RecipeListScreen = (props: Props) => {
  const [myRecipes, setMyRecipes] = useState<(Recipe)[]>([]);
  const [myRecipeGroups, setMyRecipeGroups] = useState<(RecipeGroup)[]>([]);
  const [listRefreshing, setListRefreshing] = useState<boolean>(false);

  const theme = useTheme();

  if (props.route.params?.shownRecipeGroup) {
    props.navigation.setOptions({ title: props.route.params?.shownRecipeGroup?.title });
  } else {
    props.navigation.setOptions({ title: "My recipes" });
  }

  const addActions: IActionProps[] = [
    {
      text: "Add recipe",
      name: "addRecipe",
      color: theme["color-primary-default"]
    },
    {
      text: "Import recipe",
      name: "importRecipe",
      color: theme["color-primary-default"]
    },
    {
      text: "Add recipe group",
      name: "addRecipeGroup",
      color: theme["color-primary-default"]
    }

  ];

  const onActionButtonPress = (pressedItem: string | undefined) => {
    if (!pressedItem) {
      return;
    }

    switch (pressedItem) {
      case 'importRecipe':
        props.navigation.navigate("ImportScreen", {});
        break;
      case 'addRecipe':
        props.navigation.navigate("RecipeWizardScreen", {
          onRecipeChanged: fetchData,
        });
        break;
      case 'addRecipeGroup':
        props.navigation.navigate("RecipeGroupEditScreen", {
          onRecipeGroupChanges: () => {
            fetchData();
          }
        })
        break;
    }
  }


  const renderRecipeTitle = (headerProps: ViewProps | undefined, title: string) => (
    <Text numberOfLines={2} style={{ height: 60, padding: 10, fontWeight: "bold" }} >
      {title}
    </Text>
  );
  const renderRecipeGroupTitle = (headerProps: ViewProps | undefined, title: string) => (
    <View style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>
      <Text numberOfLines={1} style={{ fontWeight: "bold" }} >
        {title}
      </Text>
    </View>
  );

  const createRecipeListItem = (recipe: Recipe) => {
    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() => openRecipe(recipe)}>
        <Layout style={{ height: 180 }}>
          <RecipeImageComponent
            forceFitScaling={true}
            uuid={recipe.images.length > 0 ? recipe.images[0].uuid : undefined} />
        </Layout>
        {renderRecipeTitle(undefined, recipe.title)}
      </Pressable>
    );
  }
  const createRecipeGroupListItem = (recipeGroup: RecipeGroup) => {
    return (
      < Card
        style={styles.recipeGroupCard}
        status='basic'
        onPress={() => props.navigation.push("RecipeListDetailScreen", { shownRecipeGroup: recipeGroup })}
        footer={headerProps => renderRecipeGroupTitle(headerProps, recipeGroup.title)}
        header={
          <View>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <FolderIcon width={32} height={32} />
            </View>
          </View>}
      >
        <Layout style={{ height: 180 }}>

        </Layout>
      </Card >)
  }

  const renderItem = (info: ListRenderItemInfo<Recipe | RecipeGroup>): JSX.Element => {
    if (info.item.type === "Recipe") {
      return createRecipeListItem(info.item as Recipe);
    } else if (info.item.type === "RecipeGroup") {
      return createRecipeGroupListItem(info.item as RecipeGroup);
    }
    return <View></View>
  };

  const openRecipe = (recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push("RecipeScreen", { recipeId: recipe.id, onRecipeChanged: fetchData });
    }
  }

  const windowDimensions = useWindowDimensions();
  const numberOfColumns = Math.ceil(windowDimensions.width / 300);


  const fetchData = () => {
    setListRefreshing(true);
    RestAPI.getRecipes()
      .then((fetchedRecipes) => {
        setMyRecipes(fetchedRecipes);
        setListRefreshing(false);
      });
    RestAPI.getRecipeGroups().then(groups => {
      setMyRecipeGroups(groups);
    })
  }

  const getShownItems = (): (RecipeGroup | Recipe)[] => {
    if (!props.route.params?.shownRecipeGroup) {
      return [...myRecipeGroups, ...myRecipes.filter(recipe => recipe.recipeGroups.length === 0)];
    } else {
      return myRecipes.filter(recipe => recipe.recipeGroups.filter(group => group.id === props.route.params.shownRecipeGroup?.id).length > 0);
    }
  }


  useEffect(fetchData, []);

  return (
    <>
      <Layout style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'baseline' }}>
        <List
          key={numberOfColumns} //To force re render when number of columns changes
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          data={getShownItems()}
          numColumns={numberOfColumns}
          renderItem={renderItem}
          refreshing={listRefreshing}
          onRefresh={fetchData}
        />
        <FloatingAction
          actions={addActions}
          onPressItem={onActionButtonPress}
          color={theme["color-primary-default"]} />
      </Layout>
    </>
  )

}

const styles = StyleSheet.create({
  container: {
    // maxHeight: 320,
    width: "100%"
  },
  contentContainer: {
    // paddingHorizontal: 8,
    // paddingVertical: 4,
  },
  recipeCard: {
    // marginVertical: 4,
    margin: 3,
    maxWidth: 300,
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgb(240,240,240)" //TODO: Theme color

  },
  recipeGroupCard: {
    // marginVertical: 4,
    margin: 1,
    flex: 1
  },
  cardcontainer: {
    flex: 1,
    flexDirection: 'row',
  },
  containerImage: {
    flex: 1,
    width: undefined,
    height: 100,
  }
});

export default RecipeListScreen;