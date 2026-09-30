import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Appbar, Button, Card, IconButton, List, Surface} from 'react-native-paper';
import {
  useCreateHouseholdInviteMutation,
  useGetHouseholdInvitesQuery,
  useGetHouseholdQuery,
  useRemoveHouseholdMemberMutation,
  useRenameHouseholdMutation,
  useRevokeHouseholdInviteMutation,
  useSetHouseholdSharingMutation,
} from '../../api/endpoints/households';
import {useCookbookRecipes} from '../../api/endpoints/recipes';
import {HouseholdInvite, HouseholdMember} from '../../api/types/households';
import {QueryFallback} from '../../components/QueryFallback';
import {SwitchRow} from '../../components/SwitchRow';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {HOUSEHOLD_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import {PromptUtil} from '../../helper/Prompt';
import {shareLink} from '../../helper/shareLink';
import {TextPromptUtil} from '../../helper/TextPrompt';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {useOwnRecipeCount} from './useOwnRecipeCount';

type Props = NativeStackScreenProps<MainNavigationProps, 'HouseholdScreen'>;

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
  const online = useIsOnline();

  const {data: household, error, refetch} = useGetHouseholdQuery(householdId);
  const invites = useGetHouseholdInvitesQuery(householdId).data ?? [];
  const recipeCount = useCookbookRecipes(householdId).data?.length ?? 0;
  const ownRecipeCount = useOwnRecipeCount();

  const [renameHousehold, renaming] = useRenameHouseholdMutation();
  const [setHouseholdSharing, sharing] = useSetHouseholdSharingMutation();
  const [removeHouseholdMember, removing] = useRemoveHouseholdMemberMutation();
  const [createHouseholdInvite, inviting] = useCreateHouseholdInviteMutation();
  const [revokeHouseholdInvite, revoking] = useRevokeHouseholdInviteMutation();
  const controlsDisabled = !online || [renaming, sharing, removing, inviting, revoking].some((request) => request.isLoading);

  const change = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (failure) {
      SnackbarUtil.show({message: t(errorMessageKey(failure, 'screens.households.saveFailed'))});
      return false;
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
      onConfirm: (name) => change(() => renameHousehold({householdId, name}).unwrap()),
    });
  }, [change, household?.name, householdId, t]);

  useEffect(() => {
    setAppbarOptions(props.navigation, {
      title: household?.name ?? t('screens.households.screenTitle'),
      actions: (
        <Appbar.Action
          testID="householdRenameButton"
          icon="pencil-outline"
          disabled={!household || controlsDisabled}
          color={theme.colors.onPrimary}
          accessibilityLabel={t('screens.households.renameTitle')}
          onPress={rename} />
      ),
    });
  }, [household, controlsDisabled, props.navigation, rename, t, theme]);

  const invite = () => change(async () => {
    const created = await createHouseholdInvite(householdId).unwrap();
    await shareLink(household?.name ?? '', created.link);
  });

  const revoke = (openInvite: HouseholdInvite) => PromptUtil.show({
    title: t('screens.households.revokeInviteTitle'),
    message: t('screens.households.revokeInviteMessage'),
    destructive: true,
    confirm: t('screens.households.revokeInvite'),
    cancel: t('common.cancel'),
    onConfirm: () => change(() => revokeHouseholdInvite({householdId, inviteId: openInvite.token}).unwrap()),
  });

  const part = (member: HouseholdMember) => PromptUtil.show({
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
      if (await change(() => removeHouseholdMember({householdId, memberUserId: member.userId}).unwrap()) &&
        member.me) {
        props.navigation.goBack();
      }
    },
  });

  if (!household) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  const me = household.members?.find((member) => member.me);

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
        <Card style={CentralStyles.elementSpacing}>
          <Card.Title title={t('screens.households.cookbook')}
            subtitle={t('screens.households.recipeCount', {count: recipeCount})} />
          <Card.Content>
            <SwitchRow
              label={t('screens.households.shareMyRecipes', {count: ownRecipeCount})}
              explanation={t('screens.households.shareExplanation')}
              value={household.shareRecipes}
              disabled={controlsDisabled}
              onChange={(value) => change(() => setHouseholdSharing({householdId, shareRecipes: value}).unwrap())} />
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
                  <Button compact disabled={controlsDisabled} onPress={() => part(member)}>
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
                      accessibilityLabel={t('screens.households.shareInvite')}
                      onPress={() => shareLink(household.name, openInvite.link)} />
                    <Button compact disabled={controlsDisabled} onPress={() => revoke(openInvite)}>
                      {t('screens.households.revokeInvite')}
                    </Button>
                  </View>
                )} />
            ))}
            <Button mode="outlined" disabled={controlsDisabled} onPress={invite}>
              {t('screens.households.invite')}
            </Button>
          </Card.Content>
        </Card>

        {me &&
          <Button mode="outlined" disabled={controlsDisabled} style={CentralStyles.elementSpacing}
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
