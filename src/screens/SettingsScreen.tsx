import {Picker} from '@react-native-picker/picker';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, Button, Card, IconButton, Surface, Switch, Text, TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import Spacer from 'react-spacer';
import AppPersistence from '../AppPersistence';
import {CustomCard} from '../components/CustomCard';
import RestAPI from '../dao/RestAPI';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {DISPLAY_NAME_MAX_LENGTH} from '../helper/nameLimits';
import {PromptUtil} from '../helper/Prompt';
import {setAppbarOptions} from '../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps} from '../navigation/NavigationRoutes';
import {logout} from '../redux/features/authSlice';
import {changeTheme} from '../redux/features/settingsSlice';
import {RootState} from '../redux/store';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'SettingsScreen'>,
        NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
    >;

export const SettingsScreen = (props: Props) => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const backendUrl = useSelector((state: RootState) => state.settings.backendUrl);
  const dispatch = useDispatch();
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  // Needed to address the password reset. Falls back to the offline copy stored at login.
  const [emailAddress, setEmailAddress] = useState('');
  const [passwordResetPending, setPasswordResetPending] = useState(false);

  const ocrImportEnabled = useSelector((state: RootState) => state.settings.ocrImportEnabled);
  const householdsEnabled = useSelector((state: RootState) => state.settings.householdsEnabled);
  const [scanTrainingConsent, setScanTrainingConsent] = useState(false);
  const [askPlanningDetails, setAskPlanningDetails] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [savedDisplayName, setSavedDisplayName] = useState('');
  const [savingDisplayName, setSavingDisplayName] = useState(false);

  useEffect(() => {
    AppPersistence.getScanTrainingConsent().then((consent) => setScanTrainingConsent(consent ?? false));
    AppPersistence.getAskForPlanningDetails().then(setAskPlanningDetails);
  }, []);

  useEffect(() => {
    RestAPI.getUserInfo()
        .then((userInfo) => {
          setEmailAddress(userInfo?.email ?? '');
          setDisplayName(userInfo?.displayName ?? '');
          setSavedDisplayName(userInfo?.displayName ?? '');
        })
        .catch(() => setEmailAddress(''));
  }, []);

  useEffect(() => {
    return props.navigation.addListener('focus', () => {
      setAppbarOptions(props.navigation.getParent(), {
        title: t('screens.settings.screenTitle'),
        // Clearing both sides: the recipe list leaves a back action in the
        // shared header when it is showing a group, and it belongs to that tab.
        leading: undefined,
        actions: undefined,
      });
    });
  }, [props.navigation]);

  const deleteAccount = () => {
    PromptUtil.show({
      title: t('screens.settings.deleteAccount'),
      message: t('screens.settings.deleteAccountConfirmationQuestion'),
      destructive: true,
      confirm: t('common.delete'),
      onConfirm: () => {
        // Signed out only once the account is actually gone: doing it first left somebody at
        // the login screen believing a request that had failed.
        RestAPI.deleteAccount()
            .then(() => dispatch(logout()))
            .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
      },
      cancel: t('common.cancel'),
    });
  };

  const performLogout = () => {
    AppPersistence.setAuthToken('');
    AppPersistence.setRefreshToken('');
    dispatch(logout());
  };

  // Reuses the reset flow rather than adding a second way to set a password: the user proves
  // they own the mailbox, and the app never handles the old or the new password itself.
  const sendPasswordResetLink = () => {
    setPasswordResetPending(true);
    RestAPI.requestPasswordReset(emailAddress)
        .then(() => SnackbarUtil.show({message: t('screens.settings.changePasswordSent')}))
        .catch((error) => SnackbarUtil.show(
            {message: t(errorMessageKey(error, 'errors.mailFailed'))}))
        .finally(() => setPasswordResetPending(false));
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

  // Recorded per submission, so switching this off stops future scans being kept but says
  // nothing about the ones already donated - which is what the deletion below is for.
  const onScanTrainingConsentChange = (consented: boolean) => {
    setScanTrainingConsent(consented);
    AppPersistence.setScanTrainingConsent(consented);
  };

  // Turned off from the question itself after an import; turned back on here
  const onAskPlanningDetailsChange = (ask: boolean) => {
    setAskPlanningDetails(ask);
    AppPersistence.setAskForPlanningDetails(ask);
  };

  const onDeleteScanDataPress = () => {
    PromptUtil.show({
      title: t('screens.settings.deleteScanData'),
      message: t('screens.settings.deleteScanDataQuestion'),
      destructive: true,
      confirm: t('common.delete'),
      onConfirm: () => {
        RestAPI.deleteScanTrainingData()
            .then(() => SnackbarUtil.show({message: t('screens.settings.deleteScanDataDone')}))
            .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
      },
      cancel: t('common.cancel'),
    });
  };

  const saveDisplayName = () => {
    // Saved on blur, which also happens when nothing was changed.
    if (displayName.trim() === savedDisplayName) {
      return;
    }
    setSavingDisplayName(true);
    RestAPI.setDisplayName(displayName)
        .then((userInfo) => setSavedDisplayName(userInfo.displayName ?? ''))
        .then(() => SnackbarUtil.show({message: t('screens.settings.displayNameSaved')}))
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}))
        .finally(() => setSavingDisplayName(false));
  };

  const onLogoutPress = () => {
    PromptUtil.show({
      title: t('screens.settings.logoutTitle'),
      message: t('screens.settings.logoutMessage'),
      confirm: t('common.ok'),
      onConfirm: performLogout,
      cancel: t('common.cancel'),
    });
  };

  return (
    <Surface style={[CentralStyles.fullscreen]}>
      <View style={CentralStyles.contentContainer}>
        <ScrollView>
          <Avatar.Icon style={{alignSelf: 'center', backgroundColor: 'transparent'}} size={100} color={theme.colors.onSurface} icon="server"/>
          <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{backendUrl}</Text>
          {emailAddress.length > 0 &&
            <Text style={{alignSelf: 'center'}}>{emailAddress}</Text>
          }
          <Spacer height={20} />
          {householdsEnabled &&
            <>
              <Card onPress={() => props.navigation.getParent()?.navigate('HouseholdListScreen')}>
                <Card.Title
                  title={t('screens.households.listTitle')}
                  subtitle={t('screens.settings.householdsSubtitle')}
                  subtitleNumberOfLines={2}
                  left={(iconProps) => <Avatar.Icon {...iconProps} icon="account-group" />}
                  right={(iconProps) => <IconButton {...iconProps} icon="chevron-right"
                    onPress={() => props.navigation.getParent()?.navigate('HouseholdListScreen')} />} />
              </Card>
              <Spacer height={20} />
            </>
          }
          <CustomCard>
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
              {t('screens.settings.account')}
            </Text>
            <TextInput
              mode="outlined"
              label={t('screens.settings.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={saveDisplayName}
              disabled={savingDisplayName}
              maxLength={DISPLAY_NAME_MAX_LENGTH} />
            <Text variant="bodySmall">{t('screens.settings.displayNameExplanation')}</Text>
            <Spacer height={10} />
            <Button
              mode='outlined'
              icon="lock-reset"
              loading={passwordResetPending}
              // Without an address there is nothing to send the link to
              disabled={passwordResetPending || emailAddress.length === 0}
              onPress={onChangePasswordPress}>{t('screens.settings.changePassword')}</Button>
            <Spacer height={10} />
            <Button
              mode='outlined'
              icon="logout"
              onPress={onLogoutPress}>{t('screens.settings.logout')}</Button>
          </CustomCard>
          {ocrImportEnabled &&
            <>
              <Spacer height={20} />
              <CustomCard>
                <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.settings.scanning')}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  <Switch
                    value={scanTrainingConsent}
                    onValueChange={onScanTrainingConsentChange} />
                  <Text style={{flex: 1}}>{t('screens.settings.scanTrainingConsent')}</Text>
                </View>
                <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.settings.scanTrainingConsentExplanation')}</Text>
                <Spacer height={10} />
                <Button
                  mode="outlined"
                  icon="delete-outline"
                  onPress={onDeleteScanDataPress}>
                  {t('screens.settings.deleteScanData')}
                </Button>
              </CustomCard>
            </>
          }
          <Spacer height={20} />
          <CustomCard>
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.settings.planning')}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <Switch value={askPlanningDetails} onValueChange={onAskPlanningDetailsChange} />
              <Text style={{flex: 1}}>{t('screens.settings.askPlanningDetails')}</Text>
            </View>
          </CustomCard>
          <Spacer height={20} />
          <CustomCard>
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.settings.theme')}</Text>
            <Picker
              selectedValue={selectedTheme}
              onValueChange={(value) => dispatch(changeTheme(value))}>
              <Picker.Item label={t('screens.settings.system')} value="system" />
              <Picker.Item label={t('screens.settings.light')} value="light" />
              <Picker.Item label={t('screens.settings.dark')} value="dark" />
            </Picker>
          </CustomCard>
          <Spacer height={20} />
          <View style={[styles.dangerZone, {borderColor: theme.colors.destructive}]}>
            <Text variant="bodySmall" style={{color: theme.colors.error}}>{t('screens.settings.dangerZone')}</Text>
            <Spacer height={20} />
            <Button
              icon="alert-circle-outline"
              mode="contained"
              buttonColor={theme.colors.destructive}
              textColor={theme.colors.onDestructive}
              onPress={deleteAccount}>
              {t('screens.settings.deleteAccount')}
            </Button>
          </View>
          <Spacer height={20}/>
          <View>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>App version: {Constants.expoConfig?.version}</Text>
          </View>
        </ScrollView>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  dangerZone: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
  },
});
