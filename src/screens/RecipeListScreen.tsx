import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, FAB, Surface} from 'react-native-paper';
import {RecipeList} from '../components/RecipeList';
import {Option, SelectionPopupModal} from '../components/SelectionPopupModal';
import {Recipe} from '../dao/RestAPI';
import {PromptUtil} from '../helper/Prompt';
import {VibrationUtils} from '../helper/VibrationUtil';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {updateRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


type Props = CompositeScreenProps<
  StackScreenProps<RecipeScreenNavigation, 'RecipeListDetailScreen'>,
  CompositeScreenProps<
    StackScreenProps<MainNavigationProps, 'OverviewScreen'>,
    BottomTabScreenProps<OverviewNavigationProps, 'RecipesListScreen'>
  >
>;


const RecipeListScreen = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');

  const [fabOpen, setFabOpen] = useState(false);

  const dispatch = useAppDispatch();

  const isOnline = useAppSelector((state) => state.settings.isOnline);


  const allRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
  const allRecipes = useAppSelector((state) => state.recipes.recipes);
  const shownRecipeGroup = useAppSelector((state) => state.recipes.recipeGroups.filter((recipeGroup) => recipeGroup.id == props.route.params?.shownRecipeGroupId)[0]);

  const [selectedRecipes, setSelectedRecipes] = useState(new Set<number>());
  const [multiSelectionModeActive, setMultiSelectionModeActive] = useState(false);

  const [recipeGroupSelectionOpened, setRecipeGroupSelectionOpened] = useState(false);

  useEffect(() => {
    const adjustActionbar = () => {
      if (multiSelectionModeActive) {
        props.navigation.getParent()?.getParent()?.setOptions({
          title: selectedRecipes.size + ' ' + t('common.selected'),
          headerRight: () => (
            <Appbar.Action
              icon="group"
              color={theme.colors.onPrimary}
              onPress={() => setRecipeGroupSelectionOpened(true)} />
          ),
          headerLeft: () => (
            <Appbar.Action
              icon="close"
              color={theme.colors.onPrimary}
              onPress={() => clearMultiSelectionMode()} />
          ),
        });
      } else {
        if (shownRecipeGroup !== undefined) {
          props.navigation.getParent()?.getParent()?.setOptions({
            title: shownRecipeGroup?.title,
            headerLeft: undefined,
            headerRight: () => (
              <Appbar.Action
                icon="pencil-outline"
                color={theme.colors.onPrimary}
                onPress={() => shownRecipeGroup.id && props.navigation.navigate('RecipeGroupEditScreen', {editing: true, recipeGroupId: shownRecipeGroup.id})} />
            ),
          });
        } else {
          props.navigation.getParent()?.getParent()?.setOptions({
            title: t('screens.overview.myRecipes'),
            headerRight: undefined,
            headerLeft: undefined,
          });
        }
      }
    };
    adjustActionbar();
    return props.navigation.addListener('focus', adjustActionbar);
  }, [props.navigation, shownRecipeGroup, multiSelectionModeActive, selectedRecipes]);

  const getRecipeGroupOptions = () => {
    // The key for "no group selected". Can be anything that will never exist in the real ids
    let groups: Option[] = [{key: 'none', value: 'No group'}];
    groups = [...groups, ...allRecipeGroups.map((group) => ({key: group.id ? group.id.toString() : '', value: group.title}))];
    return groups;
  };

  const openRecipe = (recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push('RecipeScreen', {
        recipeId: recipe.id,
      });
    }
  };

  const clearMultiSelectionMode = () => {
    setRecipeGroupSelectionOpened(false);
    setSelectedRecipes(new Set());
    setMultiSelectionModeActive(false);
  };

  const onMoveSelectedRecipesToGroup = (selectedOption: Option) => {
    // TODO: Move recipe objects to selected recipes instead of ids only
    const recipesToMove = allRecipes.filter((recipe) => selectedRecipes.has(recipe.id!) );
    recipesToMove.forEach((recipe) => {
      const recipeDataCopy = {...recipe};
      if (selectedOption.key === 'none') {
        recipeDataCopy.recipeGroups = [];
      } else {
        // @ts-ignore
        recipeDataCopy.recipeGroups = [{id: +selectedOption.key}];
      }
      dispatch(updateRecipe(recipeDataCopy));
    });
    clearMultiSelectionMode();
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
      <Surface testID="recipeListScreen" style={CentralStyles.fullscreen}>
        <RecipeList
          // @ts-ignore Route params are sometimes string
          shownRecipeGroupId={props.route.params?.shownRecipeGroupId && parseInt(props.route.params.shownRecipeGroupId)}
          onRecipeClick={openRecipe}
          onRecipeGroupClick={(recipeGroup) => props.navigation.push('RecipeListDetailScreen', {shownRecipeGroupId: recipeGroup.id})}
          onMultiSelectionModeToggled={(firstSelectedRecipe) => {
            setMultiSelectionModeActive(!multiSelectionModeActive);
            const newSet = new Set<number>();
            newSet.add(firstSelectedRecipe.id!);
            setSelectedRecipes(newSet);
            VibrationUtils.longPressFeedbackVibration();
          }}
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
          color={theme.colors.onPrimary}
          actions={[
            {
              size: 'medium',
              icon: 'plus',
              label: t('screens.overview.addRecipe'),
              onPress: () => {
                if (!isOnline) {
                  PromptUtil.show({title: t('common.offline.notavailabletitle'), button1: t('common.ok'), message: t('common.offline.notavailable')});
                  return;
                }
                props.navigation.navigate('RecipeWizardScreen', {});
              },
            },
            {
              icon: 'group',
              label: t('screens.overview.addRecipeGroup'),
              onPress: () => {
                if (!isOnline) {
                  PromptUtil.show({title: t('common.offline.notavailabletitle'), button1: t('common.ok'), message: t('common.offline.notavailable')});
                  return;
                }
                props.navigation.navigate('RecipeGroupEditScreen', {editing: false});
              },
            },
            {
              icon: 'import',
              label: t('screens.overview.importRecipe'),
              onPress: () => {
                if (!isOnline) {
                  PromptUtil.show({title: t('common.offline.notavailabletitle'), button1: t('common.ok'), message: t('common.offline.notavailable')});
                  return;
                }
                props.navigation.navigate('ImportScreen', {});
              },
            },
          ]}
        />
      </Surface>
      {recipeGroupSelectionOpened && <SelectionPopupModal
        modalVisible={recipeGroupSelectionOpened}
        options={getRecipeGroupOptions()}
        onClose={() => setRecipeGroupSelectionOpened(false)}
        onSelection={onMoveSelectedRecipesToGroup} /> }
    </>
  );
};


export default RecipeListScreen;
