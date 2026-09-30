import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Appbar, Button, Surface} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRecipe, useSaveRecipeCopyMutation} from '../api/endpoints/recipes';
import {isOwnRecipe} from '../api/recipeSelection';
import {RecipeNutritionSheet} from '../components/NutritionSheets';
import {QueryFallback} from '../components/QueryFallback';
import {RecipeDetailView} from '../components/RecipeDetailView';
import {AddToShoppingListButton} from '../components/shopping/AddToShoppingListButton';
import {RecipeShareDialog} from '../components/RecipeShareDialog';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {useInstanceFeatures} from '../helper/useInstanceFeatures';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {setAppbarOptions} from '../navigation/appbarOptions';
import {useIsOnline} from '../offline/useIsOnline';
import {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
  const insets = useSafeAreaInsets();
  const online = useIsOnline();
  const recipeId = props.route.params.recipeId;

  const {data: displayedRecipe, notFound, error, refetch} = useRecipe(recipeId);
  const {sharingEnabled} = useInstanceFeatures();
  const [saveRecipeCopy, {isLoading: saving}] = useSaveRecipeCopyMutation();
  const [scaledServings, setScaledServings] = useState<number>(displayedRecipe?.servings ? displayedRecipe.servings : 1);
  const [sharingOpen, setSharingOpen] = useState(false);
  const mine = displayedRecipe !== undefined && isOwnRecipe(displayedRecipe);
  const {t} = useTranslation('translation');

  const theme = useAppTheme();

  useKeepAwake();

  // Deleted, unshared or never readable: there is nothing to show.
  useEffect(() => {
    if (notFound) {
      props.navigation.goBack();
    }
  }, [notFound]);

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
      actions: (
        // Both act on a recipe that is not there yet during a cold start - a deep link straight
        // to this screen renders before the fetch comes back. Both are the owner's alone.
        <>
          {sharingEnabled && mine &&
            <Appbar.Action
              testID='recipe-share-action'
              icon="share-variant"
              disabled={!displayedRecipe || !online}
              color={theme.colors.onPrimary}
              accessibilityLabel={t('screens.recipe.sharing.shareButton')}
              onPress={() => setSharingOpen(true)} />
          }
          {mine && <Appbar.Action
            testID='recipe-edit-button'
            icon="pencil-outline"
            disabled={!displayedRecipe || !online}
            color={theme.colors.onPrimary}
            accessibilityLabel={t('screens.recipe.editRecipe')}
            onPress={() => props.navigation.navigate('RecipeWizardScreen', {
              editing: true,
              recipeId: displayedRecipe?.id,
            })} />}
        </>
      ),
    });
  }, [displayedRecipe, theme, t, sharingEnabled, mine, online]);

  // Replaces the original with the copy, so going back returns to where it was opened from.
  const saveACopy = useCallback(async () => {
    try {
      const copy = await saveRecipeCopy(recipeId).unwrap();
      SnackbarUtil.show({message: t('screens.recipe.savedACopy')});
      copy.id && props.navigation.replace('RecipeScreen', {recipeId: copy.id});
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'screens.recipe.saveACopyFailed'))});
    }
  }, [props.navigation, recipeId, t]);

  // What can be done with the recipe, below the steps. Sharing is not here: it is an action you
  // go and take, not something to read past on the way to the preparation steps.
  const renderFooterActions = () => {
    if (!displayedRecipe?.id) {
      return null;
    }
    return (
      <View style={styles.exportRow}>
        <AddToShoppingListButton style={styles.exportButton} recipeId={displayedRecipe.id} servings={scaledServings} />
      </View>
    );
  };

  if (!displayedRecipe) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  return (
    <Surface style={styles.screen}>
      {displayedRecipe &&
        <RecipeDetailView
          recipe={displayedRecipe}
          scaledServings={scaledServings}
          onScaledServingsChange={setScaledServings}
          footer={renderFooterActions()}
          nutrition={{canCorrect: mine,
            sheet: (sheetProps) => <RecipeNutritionSheet {...sheetProps} recipeId={recipeId} />}}
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
          {!mine &&
            <Button
              testID='save-copy-button'
              mode="contained-tonal"
              icon="bookmark-plus-outline"
              style={styles.saveButton}
              loading={saving}
              disabled={saving || !online}
              onPress={saveACopy}>
              {t('screens.recipe.saveACopy')}
            </Button>
          }
          <Button
            testID='guided-cooking-button'
            mode="contained"
            icon="chef-hat"
            disabled={displayedRecipe.preparationSteps.length === 0}
            onPress={() => props.navigation.navigate('GuidedCookingScreen', {recipeId, scaledServings})}>
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
  saveButton: {
    marginBottom: 8,
  },
  exportRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  exportButton: {
    maxWidth: '100%',
  },
});
