import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Appbar, Divider, FAB, Menu, Surface} from 'react-native-paper';
import AppPersistence from '../AppPersistence';
import {RecipeList} from '../components/RecipeList';
import {Option, SelectionPopupModal} from '../components/SelectionPopupModal';
import {Household, Recipe, RecipeGroup} from '../dao/RestAPI';
import {findRecipeGroupByOption, moveRecipesToGroup, toRecipeGroupOptions} from '../helper/recipeGroups';
import {useOnlineGuard} from '../helper/useOnlineGuard';
import {VibrationUtils} from '../helper/VibrationUtil';
import {setAppbarOptions} from '../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps, RecipeScreenNavigation} from '../navigation/NavigationRoutes';
import {ownRecipes, updateRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {HouseholdCookbookList} from './households/HouseholdCookbookList';
import {useHouseholds} from './households/useHouseholds';


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
  // Undefined for your own cookbook.
  const [shownHouseholdId, setShownHouseholdId] = useState<string | undefined>(undefined);
  useEffect(() => {
    AppPersistence.getShownCookbook().then(setShownHouseholdId);
  }, []);
  const showCookbook = (householdId: string | undefined) => {
    setShownHouseholdId(householdId);
    AppPersistence.setShownCookbook(householdId);
  };
  const {households} = useHouseholds();
  // Resolved against the list, so a household left meanwhile falls back to your own cookbook. A
  // recipe group is always your own, whatever the list shows.
  const shownHousehold = props.route.params?.shownRecipeGroupId === undefined ?
    households.find((household) => household.id === shownHouseholdId) :
    undefined;

  const dispatch = useAppDispatch();

  const requireOnline = useOnlineGuard();


  const allRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
  const allRecipes = useAppSelector((state) => ownRecipes(state.recipes.recipes));
  const shownRecipeGroup = useAppSelector((state) => state.recipes.recipeGroups.find((recipeGroup) => recipeGroup.id === props.route.params?.shownRecipeGroupId));

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
        setAppbarOptions(mainStackNav, {
          title: selectedRecipes.size + ' ' + t('common.selected'),
          actions: () => (
            <Appbar.Action
              icon="group"
              color={theme.colors.onPrimary}
              onPress={() => setRecipeGroupSelectionOpened(true)} />
          ),
          leading: () => (
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
        setAppbarOptions(mainStackNav, {
          title: shownRecipeGroup.title,
          leading: () => (
            <Appbar.BackAction
              color={theme.colors.onPrimary}
              onPress={() => props.navigation.goBack()} />
          ),
          actions: () => (
            <Appbar.Action
              icon="pencil-outline"
              color={theme.colors.onPrimary}
              onPress={() => shownRecipeGroup.id && props.navigation.navigate('RecipeGroupEditScreen', {editing: true, recipeGroupId: shownRecipeGroup.id})} />
          ),
        });
      } else {
        setAppbarOptions(mainStackNav, {
          title: shownHousehold ? shownHousehold.name : t('screens.overview.myRecipes'),
          leading: undefined,
          actions: households.length === 0 ? undefined : () => (
            <CookbookMenu
              households={households}
              shownHouseholdId={shownHouseholdId}
              onSelect={showCookbook} />
          ),
        });
      }
    };
    adjustActionbar();
    return props.navigation.addListener('focus', adjustActionbar);
  }, [props.navigation, shownRecipeGroup, multiSelectionModeActive, selectedRecipes,
    households, shownHousehold, shownHouseholdId]);

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
    const recipesToMove = allRecipes.filter((recipe) => recipe.id !== undefined && selectedRecipes.has(recipe.id));
    const targetGroup = findRecipeGroupByOption(allRecipeGroups, selectedOption);

    moveRecipesToGroup(recipesToMove, targetGroup)
        .forEach((movedRecipe) => dispatch(updateRecipe(movedRecipe)));
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
        {shownHousehold ?
          <HouseholdCookbookList
            householdId={shownHousehold.id}
            onRecipeClick={(recipe) => props.navigation.getParent()?.getParent()
                ?.navigate('RecipeScreen', {recipeId: recipe.id})} /> :
        <RecipeList
          // Route params coming from deep links are strings; from in-app
          // navigation they're numbers. Coerce once here.
          shownRecipeGroupId={(() => {
            const raw = props.route.params?.shownRecipeGroupId;
            if (raw == null) return undefined;
            return typeof raw === 'string' ? Number.parseInt(raw, 10) : raw;
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
          selectedRecipes={selectedRecipes} />}

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
              icon: 'chef-hat',
              label: t('navigation.suggestion'),
              onPress: () => {
                if (!requireOnline()) {
                  return;
                }
                props.navigation.navigate('RecipeSuggestionScreen');
              },
            },
            {
              size: 'medium',
              icon: 'plus',
              label: t('screens.overview.addRecipe'),
              onPress: () => {
                if (!requireOnline()) {
                  return;
                }
                props.navigation.navigate('RecipeWizardScreen', {});
              },
            },
            {
              icon: 'group',
              label: t('screens.overview.addRecipeGroup'),
              onPress: () => {
                if (!requireOnline()) {
                  return;
                }
                props.navigation.navigate('RecipeGroupEditScreen', {editing: false});
              },
            },
            {
              icon: 'import',
              label: t('screens.overview.importRecipe'),
              onPress: () => {
                if (!requireOnline()) {
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
        options={toRecipeGroupOptions(allRecipeGroups, t('common.noRecipeGroup'))}
        onClose={() => setRecipeGroupSelectionOpened(false)}
        onSelection={onMoveSelectedRecipesToGroup} /> }
    </>
  );
};


/**
 * Which cookbook the list shows. A component of its own because app bar actions cannot hold hooks.
 *
 * @param {object} props the households to offer, which one is shown, and what to do about it
 * @return {JSX.Element} the app bar action and its menu
 */
const CookbookMenu = (props: {
  households: Household[],
  shownHouseholdId: string | undefined,
  onSelect: (householdId: string | undefined) => void,
}) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  const select = (householdId: string | undefined) => {
    props.onSelect(householdId);
    setOpen(false);
  };

  const tick = (householdId: string | undefined) =>
    props.shownHouseholdId === householdId ? 'check' : undefined;

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Appbar.Action
          testID="cookbookMenuButton"
          icon="book-open-variant"
          color={theme.colors.onPrimary}
          accessibilityLabel={t('screens.overview.chooseCookbook')}
          onPress={() => setOpen(true)} />
      }>
      <Menu.Item
        title={t('screens.overview.myRecipes')}
        leadingIcon="account"
        trailingIcon={tick(undefined)}
        onPress={() => select(undefined)} />
      <Divider />
      {props.households.map((household) => (
        <Menu.Item
          key={household.id}
          title={household.name}
          leadingIcon="account-group"
          trailingIcon={tick(household.id)}
          onPress={() => select(household.id)} />
      ))}
    </Menu>
  );
};

export default RecipeListScreen;
