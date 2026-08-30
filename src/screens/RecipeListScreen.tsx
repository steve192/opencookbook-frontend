import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, FAB, Surface} from 'react-native-paper';
import {RecipeList} from '../components/RecipeList';
import {Option, SelectionPopupModal} from '../components/SelectionPopupModal';
import {Recipe, RecipeGroup} from '../dao/RestAPI';
import {PromptUtil} from '../helper/Prompt';
import {VibrationUtils} from '../helper/VibrationUtil';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {updateRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


type Props = CompositeScreenProps<
  NativeStackScreenProps<RecipeScreenNavigation, 'RecipeListDetailScreen'>,
  CompositeScreenProps<
    BottomTabScreenProps<OverviewNavigationProps, 'RecipesListScreen'>,
    NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
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
    // The header is rendered by the MainStack (two parents up from the inner
    // RecipeStack), so we reach across navigators to update it. Walking up via
    // getParent twice is fragile but mirrors how the rest of this app does it.
    const mainStackNav = props.navigation.getParent()?.getParent();

    const adjustActionbar = () => {
      if (multiSelectionModeActive) {
        mainStackNav?.setOptions({
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
              onPress={clearMultiSelectionMode} />
          ),
        });
      } else if (shownRecipeGroup !== undefined) {
        // Inside a group: surface a back button that exits the group view. Without
        // this the only way out is the system back gesture/button, since the inner
        // RecipeStack has its header hidden and the outer header's nav.back is
        // false at this depth.
        mainStackNav?.setOptions({
          title: shownRecipeGroup.title,
          headerLeft: () => (
            <Appbar.BackAction
              color={theme.colors.onPrimary}
              onPress={() => props.navigation.goBack()} />
          ),
          headerRight: () => (
            <Appbar.Action
              icon="pencil-outline"
              color={theme.colors.onPrimary}
              onPress={() => shownRecipeGroup.id && props.navigation.navigate('RecipeGroupEditScreen', {editing: true, recipeGroupId: shownRecipeGroup.id})} />
          ),
        });
      } else {
        mainStackNav?.setOptions({
          title: t('screens.overview.myRecipes'),
          headerLeft: undefined,
          headerRight: undefined,
        });
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

  // Memoize so RecipeList can React.memo its rows without busting on every parent
  // re-render (which the searchbar, multi-select state, etc. trigger).
  const openRecipe = useCallback((recipe: Recipe) => {
    if (recipe.id) {
      props.navigation.push('RecipeScreen', {
        recipeId: recipe.id,
      });
    }
  }, [props.navigation]);

  const openRecipeGroup = useCallback((recipeGroup: RecipeGroup) => {
    props.navigation.push('RecipeListDetailScreen', {shownRecipeGroupId: recipeGroup.id});
  }, [props.navigation]);

  const clearMultiSelectionMode = useCallback(() => {
    setRecipeGroupSelectionOpened(false);
    setSelectedRecipes(new Set());
    setMultiSelectionModeActive(false);
  }, []);

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
          // Route params coming from deep links are strings; from in-app
          // navigation they're numbers. Coerce once here.
          shownRecipeGroupId={(() => {
            const raw = props.route.params?.shownRecipeGroupId;
            if (raw == null) return undefined;
            return typeof raw === 'string' ? parseInt(raw, 10) : raw;
          })()}
          onRecipeClick={openRecipe}
          onRecipeGroupClick={openRecipeGroup}
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
