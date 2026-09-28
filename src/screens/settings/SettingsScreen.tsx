import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useUserInfo} from '../../helper/useUserInfo';
import {setAppbarOptions} from '../../navigation/appbarOptions';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {RootState} from '../../redux/store';
import {useAppTheme} from '../../styles/CentralStyles';
import {SettingsEntry} from './SettingsEntry';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'SettingsScreen'>,
        NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>
    >;

type SettingsRoute =
  'AccountSettingsScreen' | 'HouseholdListScreen' | 'ShoppingSettingsScreen' | 'PlanningSettingsScreen' |
  'ScanningSettingsScreen' | 'AppearanceSettingsScreen' | 'OpenSourceLicensesScreen';

export const SettingsScreen = (props: Props) => {
  const backendUrl = useSelector((state: RootState) => state.settings.backendUrl);
  const ocrImportEnabled = useSelector((state: RootState) => state.settings.ocrImportEnabled);
  const householdsEnabled = useSelector((state: RootState) => state.settings.householdsEnabled);
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const userInfo = useUserInfo();

  useEffect(() => {
    const applyHeaderOptions = () => setAppbarOptions(props.navigation.getParent(), {
      title: t('screens.settings.screenTitle'),
      // Clearing both sides: the recipe list leaves a back action in the
      // shared header when it is showing a group, and it belongs to that tab.
      leading: undefined,
      actions: undefined,
    });
    // Also on mount: choosing Bring removes the shopping tab, which mounts this screen anew while focused.
    if (props.navigation.isFocused()) {
      applyHeaderOptions();
    }
    return props.navigation.addListener('focus', applyHeaderOptions);
  }, [props.navigation]);

  const open = (route: SettingsRoute) => () => props.navigation.navigate(route);

  return (
    <SettingsPage>
      <View style={styles.header}>
        <Avatar.Icon style={styles.serverIcon} size={100} color={theme.colors.onSurface} icon="server" />
        <Text style={styles.bold}>{backendUrl}</Text>
        {userInfo?.email ? <Text>{userInfo.email}</Text> : null}
      </View>
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
      <SettingsEntry
        title={t('screens.licenses.title')}
        subtitle={t('screens.licenses.subtitle')}
        icon="scale-balance"
        onPress={open('OpenSourceLicensesScreen')} />
      <View style={styles.header}>
        <SettingsHint>{t('screens.settings.appVersion', {version: Constants.expoConfig?.version})}</SettingsHint>
      </View>
    </SettingsPage>
  );
};

const styles = StyleSheet.create({
  header: {alignItems: 'center'},
  serverIcon: {backgroundColor: 'transparent'},
  bold: {fontWeight: 'bold'},
});
