import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {Button, Layout, useTheme} from '@ui-kitten/components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {FloatingAction, IActionProps} from 'react-native-floating-action';
import {DeleteIcon} from '../assets/Icons';
import {RecipeList} from '../components/RecipeList';
import RestAPI, {Recipe} from '../dao/RestAPI';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {useAppSelector} from '../redux/hooks';


type Props = CompositeScreenProps<
  StackScreenProps<RecipeScreenNavigation, 'RecipeListDetailScreen'>,
  CompositeScreenProps<
    StackScreenProps<MainNavigationProps, 'OverviewScreen'>,
    BottomTabScreenProps<OverviewNavigationProps, 'RecipesListScreen'>
  >
>;


const RecipeListScreen = (props: Props) => {
  const theme = useTheme();
  const {t} = useTranslation('translation');

  const shownRecipeGroup = useAppSelector((state) => state.recipes.recipeGroups.filter((recipeGroup) => recipeGroup.id == props.route.params?.shownRecipeGroupId)[0]);

  if (props.route.params?.shownRecipeGroupId) {
    props.navigation.setOptions({
      title: shownRecipeGroup?.title,
      headerRight: () => (
        <>
          <Button
            onPress={() => shownRecipeGroup.id && deleteRecipeGroup(shownRecipeGroup.id)}
            accessoryLeft={<DeleteIcon fill={theme['color-danger-default']} />} />
        </>
      ),
    });
  } else {
    props.navigation.setOptions({title: t('screens.overview.myRecipes')});
  }

  const deleteRecipeGroup = (groupId: number) => {
    RestAPI.deleteRecipeGroup(groupId)
        .then(() => props.navigation.goBack())
        .catch(() => {
        // TODO: Error handling
        });
  };

  const addActions: IActionProps[] = [
    {
      text: t('screens.overview.addRecipe'),
      name: 'addRecipe',
      color: theme['color-primary-default'],
    },
    {
      text: t('screens.overview.importRecipe'),
      name: 'importRecipe',
      color: theme['color-primary-default'],
    },
    {
      text: t('screens.overview.addRecipeGroup'),
      name: 'addRecipeGroup',
      color: theme['color-primary-default'],
    },

  ];

  const onActionButtonPress = (pressedItem: string | undefined) => {
    if (!pressedItem) {
      return;
    }

    switch (pressedItem) {
      case 'importRecipe':
        props.navigation.navigate('ImportScreen', {});
        break;
      case 'addRecipe':
        props.navigation.navigate('RecipeWizardScreen', {});
        break;
      case 'addRecipeGroup':
        props.navigation.navigate('RecipeGroupEditScreen', {});
        break;
    }
  };

  const openRecipe = (recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push('RecipeScreen', {
        recipeId: recipe.id,
      });
    }
  };

  return (
    <>
      <Layout style={{flex: 1, justifyContent: 'flex-start', alignItems: 'baseline'}}>
        <RecipeList
          shownRecipeGroupId={props.route.params?.shownRecipeGroupId}
          onRecipeClick={openRecipe}
          onRecipeGroupClick={(recipeGroup) => props.navigation.push('RecipeListDetailScreen', {shownRecipeGroupId: recipeGroup.id})} />
        <FloatingAction
          actions={addActions}
          onPressItem={onActionButtonPress}
          color={theme['color-primary-default']} />
      </Layout>
    </>
  );
};


export default RecipeListScreen;
