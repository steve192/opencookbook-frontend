import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {Avatar, Button, Surface, Text, TextInput} from 'react-native-paper';
import {useCompleteOnboardingMutation} from '../../api/endpoints/account';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {DISPLAY_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

/**
 * Asks once, at first sign in, for a display name. Answered, the account says so and the app carries on.
 *
 * @return {JSX.Element} the setup screen
 */
export const OnboardingScreen = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const [name, setName] = useState('');
  const [completeOnboarding, {isLoading: saving}] = useCompleteOnboardingMutation();

  const save = () => {
    completeOnboarding(name.trim()).unwrap()
        .catch((error) => SnackbarUtil.show(
            {message: t(errorMessageKey(error, 'screens.onboarding.failed'))}));
  };

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[CentralStyles.contentContainer, styles.centered]}>
        <Avatar.Icon
          style={styles.icon}
          size={96}
          color={theme.colors.onPrimary}
          icon="chef-hat" />
        <Text variant="headlineMedium" style={styles.title}>
          {t('screens.onboarding.title')}
        </Text>
        <Text style={CentralStyles.elementSpacing}>{t('screens.onboarding.intro')}</Text>

        <TextInput
          testID="onboardingNameInput"
          mode="outlined"
          autoFocus
          label={t('screens.onboarding.nameLabel')}
          value={name}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          onChangeText={setName}
          onSubmitEditing={() => name.trim().length > 0 && !saving && save()} />

        <Button
          mode="contained"
          style={CentralStyles.elementSpacing}
          loading={saving}
          disabled={saving || name.trim().length === 0}
          onPress={save}>
          {t('screens.onboarding.save')}
        </Button>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  // Centred while it fits, scrollable once the keyboard leaves too little room.
  centered: {
    flexGrow: 1,
  },
  icon: {
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
    marginTop: 16,
  },
});
