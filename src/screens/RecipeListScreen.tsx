import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, FAB, Surface, useTheme} from 'react-native-paper';
import {RecipeList} from '../components/RecipeList';
import {Recipe} from '../dao/RestAPI';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {useAppSelector} from '../redux/hooks';
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
  const {t} = useTranslation('translation');

  const [fabOpen, setFabOpen] = useState(false);

  const shownRecipeGroup = useAppSelector((state) => state.recipes.recipeGroups.filter((recipeGroup) => recipeGroup.id == props.route.params?.shownRecipeGroupId)[0]);


  const [selectedRecipes, setSelectedRecipes] = useState(new Set<number>());
  const [multiSelectionModeActive, setMultiSelectionModeActive] = useState(false);

  useEffect(() => {
    const adjustActionbar = () => {
      if (multiSelectionModeActive) {
        props.navigation.getParent()?.getParent()?.setOptions({
          title: shownRecipeGroup?.title,
          headerRight: () => (
            <Appbar.Action
              icon="group"
              color={theme.colors.textOnPrimary}
              onPress={() => null} />
          ),
        });
      } else {
        if (shownRecipeGroup !== undefined) {
          props.navigation.getParent()?.getParent()?.setOptions({
            title: shownRecipeGroup?.title,
            headerRight: () => (
              <Appbar.Action
                icon="pencil-outline"
                color={theme.colors.textOnPrimary}
                onPress={() => shownRecipeGroup.id && props.navigation.navigate('RecipeGroupEditScreen', {editing: true, recipeGroupId: shownRecipeGroup.id})} />
            ),
          });
        } else {
          props.navigation.getParent()?.getParent()?.setOptions({
            title: t('screens.overview.myRecipes'),
            headerRight: undefined,
          });
        }
      }
    };
    return props.navigation.addListener('focus', adjustActionbar);
  }, [props.navigation, shownRecipeGroup, multiSelectionModeActive, selectedRecipes]);


  const openRecipe = (recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push('RecipeScreen', {
        recipeId: recipe.id,
      });
    }
  };

  const onRecipeSelected = (selectedRecipe: number) => {
    const selectedRecipesCopy = new Set(selectedRecipes);
    if (selectedRecipesCopy.has(selectedRecipe)) {
      selectedRecipesCopy.delete(selectedRecipe);
    } else {
      selectedRecipesCopy.add(selectedRecipe);
    }
    setSelectedRecipes(selectedRecipesCopy);
  };

  return (
    <>
      <Surface style={CentralStyles.fullscreen}>
        <RecipeList
          // @ts-ignore Route params are sometimes string
          shownRecipeGroupId={props.route.params?.shownRecipeGroupId && parseInt(props.route.params.shownRecipeGroupId)}
          onRecipeClick={openRecipe}
          onRecipeGroupClick={(recipeGroup) => props.navigation.push('RecipeListDetailScreen', {shownRecipeGroupId: recipeGroup.id})}
          onMultiSelectionModeToggled={() => setMultiSelectionModeActive(!multiSelectionModeActive)}
          multiSelectionModeActive={multiSelectionModeActive}
          onRecipeSelected={onRecipeSelected}
          selectedRecipes={selectedRecipes} />
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
              onPress: () => props.navigation.navigate('RecipeGroupEditScreen', {editing: false}),
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
