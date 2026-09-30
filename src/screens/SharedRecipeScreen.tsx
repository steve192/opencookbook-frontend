import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useLinkingURL} from 'expo-linking';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {toApiError} from '../api/ApiError';
import {useGetSharedRecipeQuery, useImportSharedRecipeMutation} from '../api/endpoints/sharing';
import {SharedImageAccess} from '../components/ImageAccessContext';
import {SharedNutritionSheet} from '../components/NutritionSheets';
import {askForPlanningDetails} from '../components/PlanningDetailsPrompt';
import {RecipeDetailView} from '../components/RecipeDetailView';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {isSameInstance, parseShareLink} from '../helper/recipeSharing';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {useIsOnline} from '../offline/useIsOnline';
import {selectLoggedIn} from '../redux/features/authSlice';
import {useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';

/** Why a share could not be shown. Each one needs its own thing said about it. */
type LoadFailure = 'gone' | 'elsewhere' | 'tooManyRequests' | 'failed';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'SharedRecipeScreen'>;

/**
 * A recipe somebody shared, read through the link they sent.
 *
 * Deliberately outside the signed in part of the app: a public link that demanded an account
 * would not be public. Only saving the recipe needs one, and that is the only thing gated here.
 *
 * @param {Props} props the share the screen was opened for
 * @return {JSX.Element} the shared recipe
 */
export const SharedRecipeScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const insets = useSafeAreaInsets();
  const loggedIn = useAppSelector(selectLoggedIn);
  const online = useIsOnline();
  // Only used to explain a share that is not here: it is the difference between "your link has
  // expired" and "this recipe lives on a server you are not signed in to".
  const signedInInstance = useAppSelector((state) => state.settings.backendUrl);

  const shareId = props.route.params.shareId;
  const {data: recipe, error, refetch} = useGetSharedRecipeQuery(shareId);
  const [importSharedRecipe, {isLoading: importing}] = useImportSharedRecipeMutation();
  const [scaledServings, setScaledServings] = useState(1);
  const [awaitingSignIn, setAwaitingSignIn] = useState(false);
  const failure = !recipe && error ? failureFor(error) : undefined;
  const linkOrigin = useShareLinkOrigin(shareId);

  useEffect(() => {
    recipe && setScaledServings(recipe.servings > 0 ? recipe.servings : 1);
  }, [recipe]);

  useEffect(() => {
    props.navigation.setOptions({
      title: recipe ? recipe.title : t('screens.sharedRecipe.screenTitle'),
    });
  }, [recipe, t]);

  // Somebody who was sent here without an account and signed up for one came for this recipe,
  // not for their own empty cookbook. This screen is still underneath, so going back to it puts
  // them where they started, now able to save it.
  useEffect(() => {
    if (awaitingSignIn && loggedIn) {
      setAwaitingSignIn(false);
      props.navigation.navigate('SharedRecipeScreen', {shareId});
    }
  }, [awaitingSignIn, loggedIn, shareId]);

  const importRecipe = async () => {
    try {
      const imported = await importSharedRecipe(shareId).unwrap();
      SnackbarUtil.show({message: t('screens.sharedRecipe.imported')});
      askForPlanningDetails(imported);
      if (imported.id) {
        props.navigation.navigate('default', {
          screen: 'RecipeScreen',
          params: {recipeId: imported.id},
        });
      }
    } catch (e) {
      SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.sharedRecipe.importFailed'))});
    }
  };

  if (failure) {
    // A share only ever resolves against the server this app talks to, so "not found" has two
    // quite different causes - and which one it was is decided here, where both the link and
    // the configured server are known, rather than in the loader.
    const shown = failure === 'gone' && linkOrigin && !isSameInstance(linkOrigin, signedInInstance) ?
      'elsewhere' :
      failure;
    const canRetry = shown === 'tooManyRequests' || shown === 'failed';

    return (
      <Surface style={[styles.screen, styles.centered]}>
        <Text style={styles.message}>
          {t(`screens.sharedRecipe.${messageKeyFor(shown)}`, {instance: linkOrigin})}
        </Text>
        {canRetry &&
          <Button mode="contained-tonal" icon="refresh" onPress={refetch}>
            {t('screens.sharedRecipe.retryButton')}
          </Button>
        }
      </Surface>
    );
  }

  if (!recipe) {
    return (
      <Surface style={[styles.screen, styles.centered]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.message}>{t('screens.sharedRecipe.loading')}</Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.screen}>
      <SharedImageAccess viaShare={shareId}>
        <RecipeDetailView
          recipe={recipe}
          scaledServings={scaledServings}
          onScaledServingsChange={setScaledServings}
          nutrition={{canCorrect: false,
            sheet: (sheetProps) => <SharedNutritionSheet {...sheetProps} shareId={shareId} />}}
        />
      </SharedImageAccess>

      <Surface elevation={3} style={[styles.actionBar, {paddingBottom: insets.bottom + 12}]}>
        {/* The recipe is on screen, so the share resolved against this very server - which is
            the same server the import goes to. Nothing left to check. */}
        <ImportAction
          loggedIn={loggedIn}
          importing={importing}
          online={online}
          onImport={importRecipe}
          onSignIn={() => {
            setAwaitingSignIn(true);
            props.navigation.navigate('default');
          }}
        />
      </Surface>
    </Surface>
  );
};

/**
 * What can be done with somebody else's recipe, which depends on who is looking.
 *
 * @param {object} props who is signed in, where, and what they asked for
 * @return {JSX.Element} the action, or the reason there is not one
 */
const ImportAction = (props: {
  loggedIn: boolean,
  importing: boolean,
  online: boolean,
  onImport: () => void,
  onSignIn: () => void,
}) => {
  const {t} = useTranslation('translation');

  if (!props.loggedIn) {
    return (
      <View style={styles.gatedAction}>
        <Text>{t('screens.sharedRecipe.signInToImport')}</Text>
        <Button mode="contained" icon="login" onPress={props.onSignIn}>
          {t('screens.sharedRecipe.signInButton')}
        </Button>
      </View>
    );
  }

  return (
    <Button
      testID='import-shared-recipe-button'
      mode="contained"
      icon="bookmark-plus-outline"
      loading={props.importing}
      disabled={props.importing || !props.online}
      onPress={props.onImport}>
      {props.importing ? t('screens.sharedRecipe.importing') : t('screens.sharedRecipe.importButton')}
    </Button>
  );
};

/**
 * The instance a share link named, if it named one.
 *
 * The route only carries the share id, because that is all the navigator matches on - but which
 * server the share lives on is in the link too, and a link to somebody else's instance has to be
 * resolved there rather than against whatever server this app happens to be signed in to.
 *
 * @param {string} shareId the share the screen was opened for
 * @return {string | undefined} the instance from the link, or undefined when it named none
 */
const useShareLinkOrigin = (shareId: string): string | undefined => {
  const openedUrl = useLinkingURL();

  return useMemo(() => {
    if (!openedUrl) {
      return undefined;
    }
    const link = parseShareLink(openedUrl);
    // Ignore a url that has moved on to another share, which happens when a second link is
    // opened while the first one is still on screen.
    return link?.shareId === shareId ? link.origin : undefined;
  }, [openedUrl, shareId]);
};

/**
 * What went wrong, as far as the request itself can say.
 *
 * @param {unknown} error what the request failed with
 * @return {LoadFailure} what happened
 */
const failureFor = (error: unknown): LoadFailure => {
  switch (toApiError(error).code) {
    case 'RATE_LIMITED':
      return 'tooManyRequests';
    case 'RESOURCE_NOT_FOUND':
      return 'gone';
    default:
      return 'failed';
  }
};

const messageKeyFor = (failure: LoadFailure) => {
  switch (failure) {
    case 'gone':
      return 'notFound';
    case 'elsewhere':
      return 'otherInstance';
    case 'tooManyRequests':
      return 'tooManyRequests';
    default:
      return 'loadFailed';
  }
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    ...CentralStyles.contentContainer,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    textAlign: 'center',
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gatedAction: {
    gap: 8,
  },
});
