import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator, Appbar, Button, Card, IconButton, List, Surface} from 'react-native-paper';
import RestAPI, {Household, HouseholdInvite, HouseholdMember} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {HOUSEHOLD_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import {TextPromptUtil} from '../../helper/TextPrompt';
import {shareLink} from '../../helper/shareLink';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {SwitchRow} from './SwitchRow';
import {useOwnRecipeCount} from './useOwnRecipeCount';

type Props = NativeStackScreenProps<MainNavigationProps, 'HouseholdScreen'>;

/**
 * @param {HouseholdInvite} revoked the invite that no longer works
 * @return {Function} drops it from the invites on screen
 */
const without = (revoked: HouseholdInvite) => (existing: HouseholdInvite[]): HouseholdInvite[] =>
  existing.filter((candidate) => candidate.token !== revoked.token);

/**
 * One household: its members, your sharing switches and its invite links. There are no roles.
 *
 * @param {Props} props the household to show
 * @return {JSX.Element} the household
 */
export const HouseholdScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const householdId = props.route.params.householdId;

  const [household, setHousehold] = useState<Household | undefined>(undefined);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);
  const [busy, setBusy] = useState(false);
  const ownRecipeCount = useOwnRecipeCount();

  const load = useCallback(() => {
    RestAPI.getHousehold(householdId)
        .then(setHousehold)
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error,
            'screens.households.loadFailed'))}));
    RestAPI.getHouseholdInvites(householdId).then(setInvites).catch(() => setInvites([]));
  }, [householdId, t]);

  useEffect(load, [load]);

  const change = useCallback(async (action: () => Promise<Household | void>): Promise<boolean> => {
    setBusy(true);
    try {
      const updated = await action();
      if (updated) {
        setHousehold(updated);
      }
      return true;
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'screens.households.saveFailed'))});
      return false;
    } finally {
      setBusy(false);
    }
  }, [t]);

  const rename = useCallback(() => {
    TextPromptUtil.show({
      title: t('screens.households.renameTitle'),
      label: t('screens.households.nameLabel'),
      initialValue: household?.name,
      maxLength: HOUSEHOLD_NAME_MAX_LENGTH,
      confirm: t('common.save'),
      cancel: t('common.cancel'),
      onConfirm: (name) => change(() => RestAPI.renameHousehold(householdId, name)),
    });
  }, [change, household?.name, householdId, t]);

  useEffect(() => {
    setAppbarOptions(props.navigation, {
      title: household?.name ?? t('screens.households.screenTitle'),
      actions: () => (
        <Appbar.Action
          testID="householdRenameButton"
          icon="pencil-outline"
          disabled={!household}
          color={theme.colors.onPrimary}
          accessibilityLabel={t('screens.households.renameTitle')}
          onPress={rename} />
      ),
    });
  }, [household, props.navigation, rename, t, theme]);

  const invite = useCallback(() => change(async () => {
    const created = await RestAPI.createHouseholdInvite(householdId);
    setInvites((existing) => [created, ...existing]);
    await shareLink(household?.name ?? '', created.link);
  }), [change, household?.name, householdId]);

  const revoke = useCallback((openInvite: HouseholdInvite) => {
    PromptUtil.show({
      title: t('screens.households.revokeInviteTitle'),
      message: t('screens.households.revokeInviteMessage'),
      destructive: true,
      confirm: t('screens.households.revokeInvite'),
      cancel: t('common.cancel'),
      onConfirm: () => change(async () => {
        await RestAPI.revokeHouseholdInvite(householdId, openInvite.token);
        setInvites(without(openInvite));
      }),
    });
  }, [change, householdId, t]);

  const part = useCallback((member: HouseholdMember) => {
    PromptUtil.show({
      title: member.me ?
        t('screens.households.leaveTitle', {name: household?.name}) :
        t('screens.households.removeTitle', {name: member.displayName}),
      message: member.me ?
        t('screens.households.leaveMessage') :
        t('screens.households.removeMessage'),
      destructive: true,
      confirm: member.me ? t('screens.households.leave') : t('screens.households.remove'),
      cancel: t('common.cancel'),
      onConfirm: async () => {
        if (!await change(() => RestAPI.removeHouseholdMember(householdId, member.userId))) {
          return;
        }
        if (member.me) {
          props.navigation.goBack();
        } else {
          load();
        }
      },
    });
  }, [change, household?.name, householdId, load, props.navigation, t]);

  if (!household) {
    return (
      <Surface style={CentralStyles.fullscreen}>
        <ActivityIndicator style={CentralStyles.elementSpacing} />
      </Surface>
    );
  }

  const me = household.members?.find((member) => member.me);

  return (
    <Surface style={CentralStyles.fullscreen}>
      <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
        <Card style={CentralStyles.elementSpacing}>
          <Card.Title title={t('screens.households.cookbook')}
            subtitle={t('screens.households.recipeCount', {count: household.recipeCount ?? 0})} />
          <Card.Content>
            <SwitchRow
              label={t('screens.households.shareMyRecipes', {count: ownRecipeCount})}
              explanation={t('screens.households.shareExplanation')}
              value={household.shareRecipes}
              disabled={busy}
              onChange={(value) => change(() => RestAPI.setHouseholdSharing(householdId, value))} />
          </Card.Content>
        </Card>

        <Card style={CentralStyles.elementSpacing}>
          <Card.Title title={t('screens.households.members')} />
          <Card.Content>
            {household.members?.map((member) => (
              <List.Item
                key={member.userId}
                title={member.displayName}
                description={t(sharingKey(member))}
                right={() => member.me ? null : (
                  <Button compact disabled={busy} onPress={() => part(member)}>
                    {t('screens.households.remove')}
                  </Button>
                )} />
            ))}
          </Card.Content>
        </Card>

        <Card style={CentralStyles.elementSpacing}>
          <Card.Title title={t('screens.households.invitesTitle')} />
          <Card.Content>
            {invites.map((openInvite) => (
              <List.Item
                key={openInvite.token}
                title={t('screens.households.inviteExpires',
                    {date: new Date(openInvite.expiresAt).toLocaleDateString()})}
                description={openInvite.link}
                descriptionNumberOfLines={2}
                right={() => (
                  <View style={CentralStyles.chipRow}>
                    <IconButton
                      icon="share-variant"
                      disabled={busy}
                      accessibilityLabel={t('screens.households.shareInvite')}
                      onPress={() => shareLink(household.name, openInvite.link)} />
                    <Button compact disabled={busy} onPress={() => revoke(openInvite)}>
                      {t('screens.households.revokeInvite')}
                    </Button>
                  </View>
                )} />
            ))}
            <Button mode="outlined" disabled={busy} onPress={invite}>
              {t('screens.households.invite')}
            </Button>
          </Card.Content>
        </Card>

        {me &&
          <Button mode="outlined" disabled={busy} style={CentralStyles.elementSpacing}
            onPress={() => part(me)}>
            {t('screens.households.leave')}
          </Button>}
      </ScrollView>
    </Surface>
  );
};

/**
 * What a member's row says about their cookbook; your own row is phrased at you.
 *
 * @param {HouseholdMember} member whose row it is
 * @return {string} the translation key for the line under their name
 */
const sharingKey = (member: HouseholdMember) => {
  if (member.me) {
    return member.shareRecipes ?
      'screens.households.youShare' as const :
      'screens.households.youDoNotShare' as const;
  }
  return member.shareRecipes ?
    'screens.households.memberSharing' as const :
    'screens.households.memberNotSharing' as const;
};
