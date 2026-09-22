import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Avatar, Button, Surface, Text, TextInput} from 'react-native-paper';
import RestAPI from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {DISPLAY_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  /** Called once the account is set up, so the app can carry on to the cookbook. */
  onDone: () => void;
}

/**
 * Asks once, at first sign in, for a display name.
 *
 * @param {Props} props what to do once it is answered
 * @return {JSX.Element} the setup screen
 */
export const OnboardingScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    RestAPI.completeOnboarding(name.trim())
        .then(props.onDone)
        .catch((error) => SnackbarUtil.show(
            {message: t(errorMessageKey(error, 'screens.onboarding.failed'))}))
        .finally(() => setSaving(false));
  };

  return (
    <Surface style={[CentralStyles.fullscreen, styles.centered]}>
      <View style={CentralStyles.contentContainer}>
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
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
    marginTop: 16,
  },
});
