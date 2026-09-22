import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {ActivityIndicator, Button, Card, Chip, Surface, Text} from 'react-native-paper';
import RestAPI, {Household} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {HOUSEHOLD_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import {TextPromptUtil} from '../../helper/TextPrompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {useHouseholds} from './useHouseholds';

type Props = NativeStackScreenProps<MainNavigationProps, 'HouseholdListScreen'>;

/**
 * The households you are in.
 *
 * @param {Props} props navigation
 * @return {JSX.Element} the list
 */
export const HouseholdListScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const {households, loading} = useHouseholds();
  const [creating, setCreating] = useState(false);

  const createNamed = useCallback(async (name: string) => {
    setCreating(true);
    try {
      const household = await RestAPI.createHousehold(name, true);
      props.navigation.navigate('HouseholdScreen', {householdId: household.id});
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'screens.households.saveFailed'))});
    } finally {
      setCreating(false);
    }
  }, [props.navigation, t]);

  const create = useCallback(async () => {
    // Only suggested when there is a display name to build it from.
    const chosenName = await RestAPI.getUserInfo()
        .then((userInfo) => userInfo.displayName?.trim())
        .catch(() => undefined);

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
  }, [createNamed, t]);

  if (loading) {
    return (
      <Surface style={CentralStyles.fullscreen}>
        <ActivityIndicator style={CentralStyles.elementSpacing} />
      </Surface>
    );
  }

  return (
    <Surface style={CentralStyles.fullscreen}>
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
          disabled={creating}
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
