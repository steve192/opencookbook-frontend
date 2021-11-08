import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Card, Layout, List, Spinner, Text, useTheme } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { FloatingAction, IActionProps } from 'react-native-floating-action';
import { RecipeImageComponent } from '../components/RecipeImageComponent';
import { StatusBar } from '../components/StatusBar';
import RestAPI, { Recipe } from '../dao/RestAPI';
import { MainNavigationProps, OverviewNavigationProps } from '../navigation/NavigationRoutes';


type Props = CompositeScreenProps<
  BottomTabScreenProps<OverviewNavigationProps, "RecipesListScreen">,
  StackScreenProps<MainNavigationProps, "OverviewScreen">
>;


const RecipeListScreen = (props: Props) => {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [listRefreshing, setListRefreshing] = useState<boolean>(false);

  const theme = useTheme();

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
        props.navigation.navigate("RecipeWizardScreen", {});
        break;
    }
  }


  const renderRecipeTitle = (headerProps: ViewProps | undefined,info: Recipe) => (
    // <View {...headerProps} style={{height: 50 }}>
    <Text numberOfLines={2} style={{ height: 60, padding: 10, fontWeight: "bold" }} >
      {info.title}
    </Text>
    // </View>
  );

  const renderItemFooter = () => (
    <Text >
      TODO
    </Text>
  );


  const renderItem = (info: ListRenderItemInfo<Recipe>) => (
    // <Layout style={{height: 200, width: 100, flex: 1, margin: 5, borderColor: "black", borderWidth: 1}}>
    //   {renderItemHeader(info.item)}
    //   <RecipeImageComponent
    //       uuid={info.item.images.length > 0 ? info.item.images[0].uuid : null} />
    // </Layout>
    <Card
      style={styles.item}
      status='control'
      onPress={() => openRecipe(info.item)}
      footer={headerProps => renderRecipeTitle(headerProps, info.item)}
      >
      <Layout style={{ height: 180}}>
        <RecipeImageComponent
          forceFitScaling={true}
          uuid={info.item.images.length > 0 ? info.item.images[0].uuid : null} />
      </Layout>
    </Card>
  );

  const openRecipe = (recipe: Recipe) => {
    props.navigation.push("RecipeScreen", { recipeId: recipe.id });
  }

  const windowDimensions = useWindowDimensions();
  const numberOfColumns = Math.ceil(windowDimensions.width / 300);


  const queryRecipes = () => {
    setListRefreshing(true);
    RestAPI.getRecipes()
      .then((fetchedRecipes) => {
        setMyRecipes(fetchedRecipes);
        setListRefreshing(false);
      });
  }

  useEffect(queryRecipes, []);

  return (
    <>
      <StatusBar />
      <Layout style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'baseline' }}>
        <List
          key={numberOfColumns} //To force re render when number of columns changes
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          data={myRecipes}
          numColumns={numberOfColumns}
          renderItem={renderItem}
          refreshing={listRefreshing}
          onRefresh={queryRecipes}
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
  item: {
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