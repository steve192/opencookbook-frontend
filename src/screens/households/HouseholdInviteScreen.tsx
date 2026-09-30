import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Button, Surface, Text} from 'react-native-paper';
import {answeredByServer} from '../../api/ApiError';
import {useAcceptHouseholdInviteMutation, usePreviewHouseholdInviteQuery} from '../../api/endpoints/households';
import {QueryFallback} from '../../components/QueryFallback';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles from '../../styles/CentralStyles';
import {SwitchRow} from '../../components/SwitchRow';
import {useOwnRecipeCount} from './useOwnRecipeCount';

type Props = NativeStackScreenProps<MainNavigationProps, 'HouseholdInviteScreen'>;

/**
 * Accepting an invitation. Sharing starts switched on.
 *
 * @param {Props} props the invite token the screen was opened with
 * @return {JSX.Element} the invitation
 */
export const HouseholdInviteScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const token = props.route.params.token;

  const online = useIsOnline();
  const {data: householdName, error, refetch} = usePreviewHouseholdInviteQuery(token);
  const [acceptHouseholdInvite, {isLoading: joining}] = useAcceptHouseholdInviteMutation();
  const recipeCount = useOwnRecipeCount();
  const [shareRecipes, setShareRecipes] = useState(true);

  const join = useCallback(async () => {
    try {
      const household = await acceptHouseholdInvite({token, shareRecipes}).unwrap();
      SnackbarUtil.show({message: t('screens.households.joined', {name: householdName})});
      props.navigation.replace('HouseholdScreen', {householdId: household.id});
    } catch (failure) {
      SnackbarUtil.show({message: t(errorMessageKey(failure, 'screens.households.inviteInvalid'))});
    }
  }, [householdName, props.navigation, shareRecipes, t, token]);

  // The server answered: the invite is not valid, as opposed to the server not being reached.
  if (error && answeredByServer(error)) {
    return (
      <Surface style={CentralStyles.screen}>
        <View style={CentralStyles.contentContainer}>
          <Text>{t('screens.households.inviteInvalid')}</Text>
        </View>
      </Surface>
    );
  }

  if (!householdName) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
        <Text variant="titleLarge">{t('screens.households.joinTitle', {name: householdName})}</Text>
        <Text style={CentralStyles.elementSpacing}>{t('screens.households.joinExplanation')}</Text>

        <SwitchRow
          label={t('screens.households.shareMyRecipes', {count: recipeCount})}
          explanation={t('screens.households.shareExplanation')}
          value={shareRecipes}
          onChange={setShareRecipes} />

        <Button mode="contained" loading={joining} disabled={!online || joining}
          style={CentralStyles.elementSpacing} onPress={join}>
          {t('screens.households.join')}
        </Button>
      </ScrollView>
    </Surface>
  );
};
