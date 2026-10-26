import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import {useGetUserInfoQuery} from '../../api/endpoints/account';
import {LegalLinks} from '../../components/LegalLinks';
import {useInstanceFeatures} from '../../helper/useInstanceFeatures';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {OfflineDataCard} from '../../offline/OfflineDataCard';
import {PwaIosInstructionsDialog} from '../../pwa/PwaIosInstructionsDialog';
import {useInstallApp} from '../../pwa/useInstallApp';
import {useAppSelector} from '../../redux/hooks';
import {useAppTheme} from '../../styles/CentralStyles';
import {SettingsEntry} from './SettingsEntry';
import {PageFrame} from '../../components/PageFrame';
import {SettingsHint} from './SettingsHint';

type Props = NativeStackScreenProps<MainNavigationProps, 'SettingsScreen'>;

type SettingsRoute =
  'AccountSettingsScreen' | 'HouseholdListScreen' | 'ShoppingSettingsScreen' | 'PlanningSettingsScreen' |
  'ScanningSettingsScreen' | 'AppearanceSettingsScreen' | 'ApiKeysScreen' | 'OpenSourceLicensesScreen';

export const SettingsScreen = (props: Props) => {
  const backendUrl = useAppSelector((state) => state.settings.backendUrl);
  const {ocrImportEnabled, householdsEnabled, apiKeysEnabled} = useInstanceFeatures();
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const {data: userInfo} = useGetUserInfoQuery();
  const installApp = useInstallApp();

  const open = (route: SettingsRoute) => () => props.navigation.navigate(route);

  return (
    <PageFrame>
      <View style={styles.header}>
        <Avatar.Icon style={styles.serverIcon} size={100} color={theme.colors.onSurface} icon="server" />
        <Text style={styles.bold}>{backendUrl}</Text>
        {userInfo?.email ? <Text>{userInfo.email}</Text> : null}
      </View>
      <OfflineDataCard />
      <SettingsEntry
        title={t('screens.settings.account')}
        subtitle={t('screens.settings.accountSubtitle')}
        icon="account-circle-outline"
        onPress={open('AccountSettingsScreen')} />
      {householdsEnabled &&
        <SettingsEntry
          title={t('screens.households.listTitle')}
          subtitle={t('screens.settings.householdsSubtitle')}
          icon="account-group"
          onPress={open('HouseholdListScreen')} />}
      <SettingsEntry
        title={t('screens.shopping.provider.setting')}
        subtitle={t('screens.settings.shoppingSubtitle')}
        icon="cart-outline"
        onPress={open('ShoppingSettingsScreen')} />
      <SettingsEntry
        title={t('screens.settings.planning')}
        subtitle={t('screens.settings.planningSubtitle')}
        icon="calendar-edit"
        onPress={open('PlanningSettingsScreen')} />
      {ocrImportEnabled &&
        <SettingsEntry
          title={t('screens.settings.scanning')}
          subtitle={t('screens.settings.scanningSubtitle')}
          icon="line-scan"
          onPress={open('ScanningSettingsScreen')} />}
      <SettingsEntry
        title={t('screens.settings.appearance')}
        subtitle={t('screens.settings.appearanceSubtitle')}
        icon="palette-outline"
        onPress={open('AppearanceSettingsScreen')} />
      {apiKeysEnabled &&
        <SettingsEntry
          title={t('screens.apiKeys.title')}
          subtitle={t('screens.settings.apiKeysSubtitle')}
          icon="key-variant"
          onPress={open('ApiKeysScreen')} />}
      {installApp.prompt.canInstall &&
        <SettingsEntry
          title={t('pwa.install.installButton')}
          subtitle={t('pwa.install.body')}
          icon="download"
          onPress={installApp.install} />}
      <SettingsEntry
        title={t('screens.licenses.title')}
        subtitle={t('screens.licenses.subtitle')}
        icon="scale-balance"
        onPress={open('OpenSourceLicensesScreen')} />
      <LegalLinks />
      <View style={styles.header}>
        <SettingsHint>{t('screens.settings.appVersion', {version: Constants.expoConfig?.version})}</SettingsHint>
      </View>
      <PwaIosInstructionsDialog visible={installApp.iosStepsShown} onDismiss={installApp.hideIosSteps} />
    </PageFrame>
  );
};

const styles = StyleSheet.create({
  header: {alignItems: 'center'},
  serverIcon: {backgroundColor: 'transparent'},
  bold: {fontWeight: 'bold'},
});
