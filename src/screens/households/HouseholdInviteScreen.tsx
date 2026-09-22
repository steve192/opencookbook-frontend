import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator, Button, Surface, Text} from 'react-native-paper';
import RestAPI from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {SwitchRow} from './SwitchRow';
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

  const [householdName, setHouseholdName] = useState<string | undefined>(undefined);
  const recipeCount = useOwnRecipeCount();
  const [shareRecipes, setShareRecipes] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    RestAPI.previewHouseholdInvite(token)
        .then(setHouseholdName)
        .catch(() => setInvalid(true));
  }, [token]);

  const join = useCallback(async () => {
    setJoining(true);
    try {
      const household = await RestAPI.acceptHouseholdInvite(token, shareRecipes);
      SnackbarUtil.show({message: t('screens.households.joined', {name: householdName})});
      props.navigation.replace('HouseholdScreen', {householdId: household.id});
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'screens.households.inviteInvalid'))});
    } finally {
      setJoining(false);
    }
  }, [householdName, props.navigation, shareRecipes, t, token]);

  if (invalid) {
    return (
      <Surface style={CentralStyles.fullscreen}>
        <View style={CentralStyles.contentContainer}>
          <Text>{t('screens.households.inviteInvalid')}</Text>
        </View>
      </Surface>
    );
  }

  if (!householdName) {
    return (
      <Surface style={CentralStyles.fullscreen}>
        <ActivityIndicator style={CentralStyles.elementSpacing} />
      </Surface>
    );
  }

  return (
    <Surface style={CentralStyles.fullscreen}>
      <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
        <Text variant="titleLarge">{t('screens.households.joinTitle', {name: householdName})}</Text>
        <Text style={CentralStyles.elementSpacing}>{t('screens.households.joinExplanation')}</Text>

        <SwitchRow
          label={t('screens.households.shareMyRecipes', {count: recipeCount})}
          explanation={t('screens.households.shareExplanation')}
          value={shareRecipes}
          onChange={setShareRecipes} />

        <Button mode="contained" loading={joining} disabled={joining}
          style={CentralStyles.elementSpacing} onPress={join}>
          {t('screens.households.join')}
        </Button>
      </ScrollView>
    </Surface>
  );
};
