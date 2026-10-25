import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setAppbarOptions} from '../navigation/appbarOptions';
import {BaseNavigatorProps, MainNavigationProps, OverviewNavigationProps} from '../navigation/NavigationRoutes';
import {SettingsEntry} from './settings/SettingsEntry';
import {PageFrame} from '../components/PageFrame';

type Props =
    CompositeScreenProps<
        BottomTabScreenProps<OverviewNavigationProps, 'MoreScreen'>,
        CompositeScreenProps<
            NativeStackScreenProps<MainNavigationProps, 'OverviewScreen'>,
            NativeStackScreenProps<BaseNavigatorProps, 'default'>
        >
    >;

// The last tab: everything that is not about recipes, the week or shopping.
export const MoreScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  useEffect(() => {
    const applyHeaderOptions = () => setAppbarOptions(props.navigation.getParent(), {
      title: t('screens.more.screenTitle'),
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

  return (
    <PageFrame>
      <SettingsEntry
        title={t('tools.title')}
        subtitle={t('screens.more.toolsSubtitle')}
        icon="chef-hat"
        onPress={() => props.navigation.navigate('ToolsOverviewScreen')} />
      <SettingsEntry
        title={t('screens.settings.screenTitle')}
        subtitle={t('screens.more.settingsSubtitle')}
        icon="cog-outline"
        onPress={() => props.navigation.navigate('SettingsScreen')} />
    </PageFrame>
  );
};
