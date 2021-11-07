import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Card, Layout, List, Text, useTheme } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Image, ListRenderItem, ListRenderItemInfo, StyleSheet, View, ViewProps } from 'react-native';
import { FloatingAction, IActionProps } from 'react-native-floating-action';
import { StatusBar } from '../components/StatusBar';
import RestAPI, { Recipe } from '../dao/RestAPI';
import { MainNavigationProps, OverviewNavigationProps } from '../navigation/NavigationRoutes';


type Props = CompositeScreenProps<
  BottomTabScreenProps<OverviewNavigationProps, "RecipesListScreen">,
  StackScreenProps<MainNavigationProps, "OverviewScreen">
>;

const RecipeListScreen = (props: Props) => {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
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
        props.navigation.navigate("RecipeWizardScreen");
        break;
    }
  }


  const renderItemHeader = (headerProps: ViewProps | undefined, info: Recipe) => (
    <View {...headerProps}>
      <Text category='h6'>
        {info.title}
      </Text>
    </View>
  );

  const renderItemFooter = () => (
    <Text >
      TODO
    </Text>
  );


  const renderItem = (info: ListRenderItemInfo<Recipe>) => (
    <Card
      style={styles.item}
      status='basic'
      onPress={() => openRecipe(info.item)}
      header={headerProps => renderItemHeader(headerProps, info.item)}
      footer={renderItemFooter}>
      <Image
        style={styles.containerImage}
        source={require("../../assets/placeholder.png")}
      />


    </Card>
  );

  const openRecipe = (recipe: Recipe) => {
    props.navigation.push("RecipeScreen", { recipeId: recipe.id });
  }

  const queryRecipes = () => {
    RestAPI.getRecipes()
      .then(setMyRecipes);
  }

  useEffect(queryRecipes, []);

  return (
    <>
      <StatusBar />
      <Layout style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'baseline' }}>
        <List
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          data={myRecipes}
          // numColumns={2}
          renderItem={renderItem}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 4,
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