import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useURL} from 'expo-linking';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppPersistence from '../AppPersistence';
import {SharedImageAccess} from '../components/ImageAccessContext';
import {RecipeDetailView} from '../components/RecipeDetailView';
import RestAPI, {Recipe} from '../dao/RestAPI';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {isSameInstance, parseShareLink} from '../helper/recipeSharing';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';

/** Why a share could not be shown. Each one needs its own thing said about it. */
type LoadFailure = 'gone' | 'elsewhere' | 'tooManyRequests' | 'failed';

const HTTP_NOT_FOUND = 404;
const HTTP_TOO_MANY_REQUESTS = 429;

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
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);

  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [failure, setFailure] = useState<LoadFailure | undefined>(undefined);
  const [scaledServings, setScaledServings] = useState(1);
  const [importing, setImporting] = useState(false);
  const [signedInInstance, setSignedInInstance] = useState<string | undefined>(undefined);
  const [awaitingSignIn, setAwaitingSignIn] = useState(false);

  const shareId = props.route.params.shareId;
  const linkOrigin = useShareLinkOrigin(shareId);

  // Only used to explain a share that is not here: it is the difference between "your link has
  // expired" and "this recipe lives on a server you are not signed in to".
  useEffect(() => {
    AppPersistence.getBackendURL().then(setSignedInInstance);
  }, []);

  // Depends on the share alone. Anything else in here - which server the app talks to, say -
  // would reload the recipe the moment it resolved, which is a second request against a rate
  // limited endpoint and a second view counted for every single reader.
  const load = useCallback(() => {
    setFailure(undefined);
    RestAPI.getSharedRecipe(shareId)
        .then((sharedRecipe) => {
          setRecipe(sharedRecipe);
          setScaledServings(sharedRecipe.servings > 0 ? sharedRecipe.servings : 1);
        })
        .catch((error) => setFailure(failureFor(error)));
  }, [shareId]);

  useEffect(load, [load]);

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
    setImporting(true);
    try {
      const imported = await RestAPI.importSharedRecipe(shareId);
      SnackbarUtil.show({message: t('screens.sharedRecipe.imported')});
      if (imported.id) {
        props.navigation.navigate('default', {
          screen: 'RecipeScreen',
          params: {recipeId: imported.id},
        });
      }
    } catch (e) {
      SnackbarUtil.show({message: t('screens.sharedRecipe.importFailed')});
    } finally {
      setImporting(false);
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
          <Button mode="contained-tonal" icon="refresh" onPress={load}>
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
        />
      </SharedImageAccess>

      <Surface elevation={3} style={[styles.actionBar, {paddingBottom: insets.bottom + 12}]}>
        {/* The recipe is on screen, so the share resolved against this very server - which is
            the same server the import goes to. Nothing left to check. */}
        <ImportAction
          loggedIn={loggedIn}
          importing={importing}
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
      disabled={props.importing}
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
  const openedUrl = useURL();

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
  const status = (error as {response?: {status?: number}})?.response?.status;
  if (status === HTTP_TOO_MANY_REQUESTS) {
    return 'tooManyRequests';
  }
  return status === HTTP_NOT_FOUND ? 'gone' : 'failed';
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
