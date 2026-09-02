import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Dialog, Portal, Text} from 'react-native-paper';
import RestAPI, {RecipeShare} from '../dao/RestAPI';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {PromptUtil} from '../helper/Prompt';
import {formatShareExpiry} from '../helper/recipeSharing';
import {shareRecipeLink} from '../helper/shareLink';
import {useOnlineGuard} from '../helper/useOnlineGuard';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  recipeId: number;
  recipeTitle: string;
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Sharing a recipe, and seeing whether it is already shared.
 *
 * Opened from the recipe's app bar rather than sitting at the bottom of the page: sharing is
 * something you go and do, not something to read past on the way to the steps. Nothing is
 * fetched until it opens, so a recipe nobody shares costs no requests at all.
 *
 * @param {Props} props the recipe being shared, and whether the dialog is open
 * @return {JSX.Element} the sharing dialog
 */
export const RecipeShareDialog = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const requireOnline = useOnlineGuard();

  const [share, setShare] = useState<RecipeShare | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  // Reported inside the dialog rather than through a snackbar: everything in a Portal renders
  // above the global snackbar, so a message raised while this is open would never be seen.
  const [failed, setFailed] = useState(false);

  const loadShare = useCallback(() => {
    if (!props.visible) {
      return;
    }
    setLoading(true);
    setFailed(false);
    RestAPI.getSharesOfRecipe(props.recipeId)
        .then((shares) => setShare(shares[0]))
        // Not knowing whether a recipe is shared is not worth an error dialog on top of a dialog;
        // the buttons below still work, and sharing again returns the existing link.
        .catch(() => setShare(undefined))
        .finally(() => setLoading(false));
  }, [props.visible, props.recipeId]);

  useEffect(loadShare, [loadShare]);

  const shareRecipe = async () => {
    if (!requireOnline()) {
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      const created = share ?? await RestAPI.shareRecipe(props.recipeId);
      setShare(created);
      const outcome = await shareRecipeLink(props.recipeTitle, created.shareUrl);

      // Out of the way first, then say what happened - a snackbar underneath this dialog is
      // no feedback at all.
      props.onDismiss();
      if (outcome === 'copied') {
        SnackbarUtil.show({message: t('screens.recipe.sharing.linkCopied')});
      }
    } catch (e) {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const stopSharing = () => {
    if (!share || !requireOnline()) {
      return;
    }
    PromptUtil.show({
      title: t('screens.recipe.sharing.stopSharingTitle'),
      message: t('screens.recipe.sharing.stopSharingMessage'),
      button1: t('screens.recipe.sharing.stopSharingButton'),
      button1Callback: async () => {
        setBusy(true);
        setFailed(false);
        try {
          await RestAPI.revokeShare(share.shareId);
          setShare(undefined);
          props.onDismiss();
          SnackbarUtil.show({message: t('screens.recipe.sharing.stoppedSharing')});
        } catch (e) {
          setFailed(true);
        } finally {
          setBusy(false);
        }
      },
      button2: t('common.cancel'),
    });
  };

  const expiry = share ? formatShareExpiry(share.expiresAt, i18n.language) : undefined;

  return (
    <Portal>
      <Dialog visible={props.visible} onDismiss={props.onDismiss} testID='recipe-share-dialog'>
        <Dialog.Title>{t('screens.recipe.sharing.sectionTitle')}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          {loading ?
            <ActivityIndicator animating={true} /> :
            <>
              <Text style={{color: theme.colors.onSurfaceVariant}}>
                {t('screens.recipe.sharing.sharedNotice')}
              </Text>
              {share &&
                <View style={styles.linkDetails}>
                  <Text testID='recipe-share-link' selectable={true} variant="bodySmall">
                    {share.shareUrl}
                  </Text>
                  {expiry &&
                    <Text
                      testID='recipe-sharing-expiry'
                      variant="bodySmall"
                      style={{color: theme.colors.onSurfaceVariant}}>
                      {t('screens.recipe.sharing.validUntil', {date: expiry})}
                    </Text>
                  }
                </View>
              }
              {failed &&
                <Text testID='recipe-sharing-error' style={{color: theme.colors.error}}>
                  {t('screens.recipe.sharing.shareFailed')}
                </Text>
              }
            </>
          }
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          {share &&
            <Button
              testID='recipe-stop-sharing-button'
              icon="link-off"
              disabled={busy}
              onPress={stopSharing}>
              {t('screens.recipe.sharing.stopSharingButton')}
            </Button>
          }
          <Button onPress={props.onDismiss} disabled={busy}>{t('common.close')}</Button>
          <Button
            testID='recipe-share-button'
            mode="contained"
            icon="share-variant"
            loading={busy}
            disabled={busy || loading}
            onPress={shareRecipe}>
            {share ? t('screens.recipe.sharing.shareAgainButton') : t('screens.recipe.sharing.shareButton')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  linkDetails: {
    gap: 4,
  },
  actions: {
    flexWrap: 'wrap',
    gap: 4,
  },
});
