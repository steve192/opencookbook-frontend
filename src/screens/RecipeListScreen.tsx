import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ApplicationProvider, Avatar, Card, Layout, List, Text, ListProps, Button } from '@ui-kitten/components';
import { FloatingAction, IActionProps } from 'react-native-floating-action';
import { CompositeScreenProps } from '@react-navigation/native';
import { MainNavigationProps, OverviewNavigationProps } from '../navigation/NavigationRoutes';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

const addActions: IActionProps[] = [
  {
    text: "Add recipe",
    name: "addRecipe"
  }

];

type Props = CompositeScreenProps<
  BottomTabScreenProps<OverviewNavigationProps, "RecipesListScreen">,
  StackScreenProps<MainNavigationProps, "OverviewScreen">
>;

const RecipeListScreen = (props: Props) => {
  


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

  const data = new Array(8).fill({
    title: 'Item',
  });
  const renderItemHeader = (headerProps, info) => (
    <View {...headerProps}>
      <Text category='h6'>
        {info.item.title} {info.index + 1}
      </Text>
    </View>
  );

  const renderItemFooter = (footerProps) => (
    <Text {...footerProps}>
      TODO
    </Text>
  );


  const renderItem = (info) => (
    <Card
      style={styles.item}
      status='basic'
      onPress={() => openRecipe(info)}
      header={headerProps => renderItemHeader(headerProps, info)}
      footer={renderItemFooter}>
      <Image
        style={styles.containerImage}
        source={{
          uri: 'https://reactnative.dev/img/tiny_logo.png',
        }}
      />


    </Card>
  );

  const openRecipe = (recipeInfo) => {
    props.navigation.push("RecipeScreen");
  }

  return (

    <Layout style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'baseline' }}>
      <Text category="h2">My Recipes</Text>
      <List
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={data}
        // numColumns={2}
        renderItem={renderItem}
      />
      <FloatingAction actions={addActions} onPressItem={name => { props.navigation.push("RecipeWizardScreen") }}></FloatingAction>
    </Layout>
  )

}

export default RecipeListScreen;