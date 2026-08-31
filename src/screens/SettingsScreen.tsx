import {Picker} from '@react-native-picker/picker';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Avatar, Button, Caption, Divider, Surface, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import Spacer from 'react-spacer';
import AppPersistence from '../AppPersistence';
import {CustomCard} from '../components/CustomCard';
import RestAPI from '../dao/RestAPI';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {PromptUtil} from '../helper/Prompt';
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

  useEffect(() => {
    RestAPI.getUserInfo()
        .then((userInfo) => setEmailAddress(userInfo?.email ?? ''))
        .catch(() => setEmailAddress(''));
  }, []);

  useEffect(() => {
    return props.navigation.addListener('focus', () => {
      props.navigation.getParent()?.setOptions({
        title: t('screens.settings.screenTitle'),
        // Clearing both sides: the recipe list leaves a back action in the
        // shared header when it is showing a group, and it belongs to that tab.
        headerLeft: undefined,
        headerRight: undefined,
      });
    });
  }, [props.navigation]);

  const deleteAccount = () => {
    PromptUtil.show({
      title: t('screens.settings.deleteAccount'),
      message: t('screens.settings.deleteAccountConfirmationQuestion'),
      button1: t('common.delete'),
      button1Callback: () => {
        RestAPI.deleteAccount();
        dispatch(logout());
      },
      button2: t('common.cancel'),
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
        .catch(() => SnackbarUtil.show({message: t('screens.settings.changePasswordFailed')}))
        .finally(() => setPasswordResetPending(false));
  };

  const onChangePasswordPress = () => {
    PromptUtil.show({
      title: t('screens.settings.changePasswordTitle'),
      message: t('screens.settings.changePasswordMessage', {email: emailAddress}),
      button1: t('common.ok'),
      button1Callback: sendPasswordResetLink,
      button2: t('common.cancel'),
    });
  };

  const onLogoutPress = () => {
    PromptUtil.show({
      title: t('screens.settings.logoutTitle'),
      message: t('screens.settings.logoutMessage'),
      button1: t('common.ok'),
      button1Callback: performLogout,
      button2: t('common.cancel'),
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
            onPress={onLogoutPress}>{t('screens.settings.logout')}</Button>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
          <Spacer height={20} />
          <CustomCard>
            <Caption>{t('screens.settings.theme')}</Caption>
            <Picker
              selectedValue={selectedTheme}
              onValueChange={(value) => dispatch(changeTheme(value))}>
              <Picker.Item label={t('screens.settings.system')} value="system" />
              <Picker.Item label={t('screens.settings.light')} value="light" />
              <Picker.Item label={t('screens.settings.dark')} value="dark" />
            </Picker>
          </CustomCard>
          <Spacer height={20} />
          <View style={{padding: 10, borderWidth: 1, borderRadius: 16, borderColor: 'red'}}>
            <Caption style={{color: theme.colors.error}}>{t('screens.settings.dangerZone')}</Caption>
            <Spacer height={20} />
            <Button
              dark={true}
              icon="alert-circle-outline"
              mode="contained"
              buttonColor={theme.colors.error}
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
