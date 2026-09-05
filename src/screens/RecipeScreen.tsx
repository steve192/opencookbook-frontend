import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Appbar, Button, Surface} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BringImportButton} from '../components/BringExportButton';
import {RecipeDetailView} from '../components/RecipeDetailView';
import {RecipeShareDialog} from '../components/RecipeShareDialog';
import {useOnlineGuard} from '../helper/useOnlineGuard';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {setAppbarOptions} from '../navigation/appbarOptions';
import {fetchSingleRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
  const dispatch = useAppDispatch();
  const focussed = useIsFocused();
  const insets = useSafeAreaInsets();
  const requireOnline = useOnlineGuard();

  const displayedRecipe = useAppSelector((state) => state.recipes.recipes.filter((recipe) => recipe.id == props.route.params.recipeId)[0]);
  const sharingEnabled = useAppSelector((state) => state.settings.sharingEnabled);
  const [scaledServings, setScaledServings] = useState<number>(displayedRecipe?.servings ? displayedRecipe.servings : 1);
  const [sharingOpen, setSharingOpen] = useState(false);
  const {t} = useTranslation('translation');

  const theme = useAppTheme();

  useKeepAwake();

  useEffect(() => {
    // Load recipe if recipe id of screen has changed or screen is navigated to
    dispatch(fetchSingleRecipe(props.route.params.recipeId))
        .then((result) => {
          if (result.meta.requestStatus === 'rejected') {
            // Recipe does not exist, try to go back
            props.navigation.goBack();
          }
        });
  }, [props.route.params.recipeId, focussed]);

  // Only when a different recipe is shown. Keyed on the recipe object, this also ran on every
  // refetch, so scaling to eight servings was undone by leaving the app and coming back. The
  // recipe's own id is in here as well because on a cold start - a deep link straight to a
  // recipe - there is nothing loaded yet when the screen first mounts, and the amounts would
  // otherwise stay scaled to the one serving they were initialised with.
  useEffect(() => {
    displayedRecipe && setScaledServings(displayedRecipe.servings);
  }, [props.route.params.recipeId, displayedRecipe?.id]);

  useEffect(() => {
    setAppbarOptions(props.navigation, {
      title: displayedRecipe ? displayedRecipe.title : t('screens.recipe.loading'),
      actions: () => (
        // Both act on a recipe that is not there yet during a cold start - a deep link straight
        // to this screen renders before the fetch comes back.
        <>
          {sharingEnabled &&
            <Appbar.Action
              testID='recipe-share-action'
              icon="share-variant"
              disabled={!displayedRecipe}
              color={theme.colors.onPrimary}
              accessibilityLabel={t('screens.recipe.sharing.shareButton')}
              onPress={() => setSharingOpen(true)} />
          }
          <Appbar.Action
            testID='recipe-edit-button'
            icon="pencil-outline"
            disabled={!displayedRecipe}
            color={theme.colors.onPrimary}
            accessibilityLabel={t('screens.recipe.editRecipe')}
            onPress={() => {
              if (!requireOnline()) {
                return;
              }
              props.navigation.navigate('RecipeWizardScreen', {
                editing: true,
                recipeId: displayedRecipe.id,
              });
            }} />
        </>
      ),
    });
  }, [displayedRecipe, theme, t, sharingEnabled]);

  // What can be done with a recipe of your own, below the steps. Sharing is not here: it is an
  // action you go and take, not something to read past on the way to the preparation steps.
  const renderOwnerActions = () => (
    displayedRecipe.id ?
      <View style={styles.exportRow}>
        <BringImportButton style={styles.exportButton} recipeId={displayedRecipe.id} />
      </View> :
      null
  );

  return (
    <Surface style={styles.screen}>
      {displayedRecipe &&
        <RecipeDetailView
          recipe={displayedRecipe}
          scaledServings={scaledServings}
          onScaledServingsChange={setScaledServings}
          footer={renderOwnerActions()}
        />
      }

      {sharingEnabled && displayedRecipe?.id &&
        <RecipeShareDialog
          recipeId={displayedRecipe.id}
          recipeTitle={displayedRecipe.title}
          visible={sharingOpen}
          onDismiss={() => setSharingOpen(false)} />
      }

      {/* Within reach instead of halfway down the page, between ingredients and steps */}
      {displayedRecipe &&
        <Surface elevation={3} style={[styles.actionBar, {paddingBottom: insets.bottom + 12}]}>
          <Button
            testID='guided-cooking-button'
            mode="contained"
            icon="chef-hat"
            disabled={displayedRecipe.preparationSteps.length === 0}
            onPress={() => props.navigation.navigate('GuidedCookingScreen', {recipe: displayedRecipe, scaledServings: scaledServings})}>
            {t('screens.recipe.startCookingButton')}
          </Button>
        </Surface>
      }
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  exportRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  exportButton: {
    maxWidth: '100%',
  },
});
