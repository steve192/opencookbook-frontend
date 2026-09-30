import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Button, Card, Chip, Surface, Text} from 'react-native-paper';
import {useGetUserInfoQuery} from '../../api/endpoints/account';
import {useCreateHouseholdMutation, useGetHouseholdsQuery} from '../../api/endpoints/households';
import {Household} from '../../api/types/households';
import {QueryFallback} from '../../components/QueryFallback';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {HOUSEHOLD_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import {TextPromptUtil} from '../../helper/TextPrompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles from '../../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'HouseholdListScreen'>;

/**
 * The households you are in.
 *
 * @param {Props} props navigation
 * @return {JSX.Element} the list
 */
export const HouseholdListScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const {data: households, error, refetch} = useGetHouseholdsQuery();
  const {data: userInfo} = useGetUserInfoQuery();
  const [createHousehold, {isLoading: creating}] = useCreateHouseholdMutation();

  const createNamed = useCallback(async (name: string) => {
    try {
      const household = await createHousehold({name, shareRecipes: true}).unwrap();
      props.navigation.navigate('HouseholdScreen', {householdId: household.id});
    } catch (failure) {
      SnackbarUtil.show({message: t(errorMessageKey(failure, 'screens.households.saveFailed'))});
    }
  }, [props.navigation, t]);

  const create = useCallback(() => {
    // Only suggested when there is a display name to build it from.
    const chosenName = userInfo?.displayName?.trim();
    TextPromptUtil.show({
      title: t('screens.households.createTitle'),
      message: t('screens.households.createMessage'),
      label: t('screens.households.nameLabel'),
      initialValue: chosenName ? t('screens.households.defaultName', {name: chosenName}) : '',
      maxLength: HOUSEHOLD_NAME_MAX_LENGTH,
      confirm: t('common.create'),
      cancel: t('common.cancel'),
      onConfirm: createNamed,
    });
  }, [createNamed, userInfo, t]);

  if (!households) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
        {households.length === 0 &&
          <Text style={CentralStyles.elementSpacing}>{t('screens.households.empty')}</Text>}

        {households.map((household) => (
          <HouseholdCard
            key={household.id}
            household={household}
            onOpen={() => props.navigation.navigate('HouseholdScreen', {householdId: household.id})} />
        ))}

        <Button
          mode="contained"
          loading={creating}
          disabled={!online || creating}
          style={CentralStyles.elementSpacing}
          onPress={create}>
          {t('screens.households.create')}
        </Button>
      </ScrollView>
    </Surface>
  );
};

const HouseholdCard = (props: {household: Household, onOpen: () => void}) => {
  const {t} = useTranslation('translation');
  const {household} = props;

  return (
    <Card style={CentralStyles.elementSpacing} onPress={props.onOpen}>
      <Card.Title title={household.name}
        subtitle={t('screens.households.memberCount', {count: household.memberCount})} />
      <Card.Content>
        <View style={CentralStyles.chipRow}>
          <Chip compact icon={household.shareRecipes ? 'book-open-variant' : 'book-lock-outline'}>
            {household.shareRecipes ?
              t('screens.households.youShare') :
              t('screens.households.youDoNotShare')}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};
