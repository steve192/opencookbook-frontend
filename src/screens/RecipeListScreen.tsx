import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, FAB, Surface, useTheme} from 'react-native-paper';
import {RecipeList} from '../components/RecipeList';
import {Recipe} from '../dao/RestAPI';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {deleteRecipeGroup} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';


type Props = CompositeScreenProps<
  StackScreenProps<RecipeScreenNavigation, 'RecipeListDetailScreen'>,
  CompositeScreenProps<
    StackScreenProps<MainNavigationProps, 'OverviewScreen'>,
    BottomTabScreenProps<OverviewNavigationProps, 'RecipesListScreen'>
  >
>;


const RecipeListScreen = (props: Props) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {t} = useTranslation('translation');

  const [fabOpen, setFabOpen] = useState(false);

  const shownRecipeGroup = useAppSelector((state) => state.recipes.recipeGroups.filter((recipeGroup) => recipeGroup.id == props.route.params?.shownRecipeGroupId)[0]);

  useEffect(() => {
    return props.navigation.addListener('focus', () => {
      if (shownRecipeGroup !== undefined) {
        props.navigation.getParent()?.getParent()?.setOptions({
          title: shownRecipeGroup?.title,
          headerRight: () => (
            <Appbar.Action
              icon="delete-outline"
              color={theme.colors.error}
              onPress={() => shownRecipeGroup.id && dispatchDeleteRecipeGroup(shownRecipeGroup.id)} />
          ),
        });
      } else {
        props.navigation.getParent()?.getParent()?.setOptions({
          title: t('screens.overview.myRecipes'),
          headerRight: undefined,
        });
      }
    });
  }, [props.navigation]);


  const dispatchDeleteRecipeGroup = (groupId: number) => {
    dispatch(deleteRecipeGroup(groupId)).then(() => {
      props.navigation.goBack();
    });
  };


  const openRecipe = (recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push('RecipeScreen', {
        recipeId: recipe.id,
      });
    }
  };
  console.log(props.navigation);

  return (
    <>
      <Surface style={CentralStyles.fullscreen}>
        <RecipeList
          // @ts-ignore Route params are sometimes string
          shownRecipeGroupId={props.route.params?.shownRecipeGroupId && parseInt(props.route.params.shownRecipeGroupId)}
          onRecipeClick={openRecipe}
          onRecipeGroupClick={(recipeGroup) => props.navigation.push('RecipeListDetailScreen', {shownRecipeGroupId: recipeGroup.id})} />
        <FAB.Group
          icon="plus"
          open={fabOpen}
          visible={true}
          onStateChange={(state) => setFabOpen(state.open)}
          fabStyle={{
            backgroundColor: theme.colors.primary,
          }}
          color={theme.colors.textOnPrimary}
          actions={[
            {
              small: false,
              icon: 'plus',
              label: t('screens.overview.addRecipe'),
              onPress: () => props.navigation.navigate('RecipeWizardScreen', {}),
            },
            {
              icon: 'group',
              label: t('screens.overview.addRecipeGroup'),
              onPress: () => props.navigation.navigate('RecipeGroupEditScreen', {}),
            },
            {
              icon: 'import',
              label: t('screens.overview.importRecipe'),
              onPress: () => props.navigation.navigate('ImportScreen', {}),
            },
          ]}
        />
      </Surface>
    </>
  );
};


export default RecipeListScreen;
