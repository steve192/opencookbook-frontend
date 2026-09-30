import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import {
  useDeleteAccountMutation, useGetUserInfoQuery, useRequestPasswordResetMutation, useSetDisplayNameMutation,
} from '../../api/endpoints/account';
import {CustomCard} from '../../components/CustomCard';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {DISPLAY_NAME_MAX_LENGTH} from '../../helper/nameLimits';
import {PromptUtil} from '../../helper/Prompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import {signOut} from '../../redux/sessionThunks';
import {logout} from '../../redux/features/authSlice';
import {useAppDispatch} from '../../redux/hooks';
import {useAppTheme} from '../../styles/CentralStyles';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'AccountSettingsScreen'>;

export const AccountSettingsScreen = (_props: Props) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();
  const {data: userInfo} = useGetUserInfoQuery();
  const emailAddress = userInfo?.email ?? '';
  const savedDisplayName = userInfo?.displayName ?? '';
  const [displayName, setDisplayName] = useState('');
  const [saveDisplayNameOf, {isLoading: savingDisplayName}] = useSetDisplayNameMutation();
  const [requestPasswordReset, {isLoading: passwordResetPending}] = useRequestPasswordResetMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  useEffect(() => setDisplayName(savedDisplayName), [savedDisplayName]);

  const saveDisplayName = () => {
    // Saved on blur, which also happens when nothing was changed.
    if (displayName.trim() === savedDisplayName) {
      return;
    }
    saveDisplayNameOf(displayName).unwrap()
        .then(() => SnackbarUtil.show({message: t('screens.settings.displayNameSaved')}))
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  // Reuses the reset flow rather than adding a second way to set a password: the user proves
  // they own the mailbox, and the app never handles the old or the new password itself.
  const sendPasswordResetLink = () => {
    requestPasswordReset(emailAddress).unwrap()
        .then(() => SnackbarUtil.show({message: t('screens.settings.changePasswordSent')}))
        .catch((error) => SnackbarUtil.show(
            {message: t(errorMessageKey(error, 'errors.mailFailed'))}));
  };

  const onChangePasswordPress = () => {
    PromptUtil.show({
      title: t('screens.settings.changePasswordTitle'),
      message: t('screens.settings.changePasswordMessage', {email: emailAddress}),
      confirm: t('common.ok'),
      onConfirm: sendPasswordResetLink,
      cancel: t('common.cancel'),
    });
  };


  const onLogoutPress = () => {
    PromptUtil.show({
      title: t('screens.settings.logoutTitle'),
      message: t('screens.settings.logoutMessage'),
      confirm: t('common.ok'),
      onConfirm: () => dispatch(signOut()),
      cancel: t('common.cancel'),
    });
  };

  const onDeleteAccountPress = () => {
    PromptUtil.show({
      title: t('screens.settings.deleteAccount'),
      message: t('screens.settings.deleteAccountConfirmationQuestion'),
      destructive: true,
      confirm: t('common.delete'),
      onConfirm: () => {
        // Signed out only once the account is actually gone: doing it first left somebody at
        // the login screen believing a request that had failed.
        deleteAccount().unwrap()
            .then(() => dispatch(logout()))
            .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
      },
      cancel: t('common.cancel'),
    });
  };

  return (
    <SettingsPage>
      <CustomCard style={styles.card}>
        <TextInput
          mode="outlined"
          label={t('screens.settings.displayName')}
          value={displayName}
          onChangeText={setDisplayName}
          onBlur={saveDisplayName}
          disabled={!online || savingDisplayName}
          maxLength={DISPLAY_NAME_MAX_LENGTH} />
        <SettingsHint>{t('screens.settings.displayNameExplanation')}</SettingsHint>
      </CustomCard>
      <CustomCard style={styles.card}>
        <Button
          mode="outlined"
          icon="lock-reset"
          loading={passwordResetPending}
          // Without an address there is nothing to send the link to
          disabled={!online || passwordResetPending || emailAddress.length === 0}
          onPress={onChangePasswordPress}>{t('screens.settings.changePassword')}</Button>
        <Button mode="outlined" icon="logout" onPress={onLogoutPress}>{t('screens.settings.logout')}</Button>
      </CustomCard>
      <View style={[styles.card, styles.dangerZone, {borderColor: theme.colors.destructive}]}>
        <Text variant="bodySmall" style={{color: theme.colors.error}}>{t('screens.settings.dangerZone')}</Text>
        <Button
          icon="alert-circle-outline"
          mode="contained"
          buttonColor={theme.colors.destructive}
          textColor={theme.colors.onDestructive}
          disabled={!online}
          onPress={onDeleteAccountPress}>
          {t('screens.settings.deleteAccount')}
        </Button>
      </View>
    </SettingsPage>
  );
};

const styles = StyleSheet.create({
  card: {gap: 10},
  dangerZone: {padding: 10, borderWidth: 1, borderRadius: 16},
});
