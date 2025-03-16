import React from 'react';
import {useAppSelector} from '../../redux/hooks';
import {Redirect, useRouter} from 'expo-router';
import {MaterialBottomTabs as Tabs} from '../../MaterialBottomTabs';
import {useTranslation} from 'react-i18next';
import {Icon} from 'react-native-paper';

export default function Main() {
  const loggedIn = useAppSelector((state) => state.auth.loggedIn);
  const {t} = useTranslation('translation');
  return !loggedIn ? <Redirect href="/login" /> :
  <Tabs>
    <Tabs.Screen
      name="(overview)/index"
      options={{
        tabBarLabel: t('screens.overview.myRecipes'),
        tabBarIcon: ({color, size}) => {
          return <Icon source="home" size={size} color={color} />;
        },
      }}
    />
    <Tabs.Screen
      name="weekly"
      options={{
        tabBarLabel: t('screens.weekplan.screenTitle'),
        tabBarIcon: ({color, size}) => {
          return <Icon source="calendar" size={size} color={color} />;
        },
      }}
    />
    <Tabs.Screen
      name="settings"
      options={{
        tabBarLabel: t('screens.settings.screenTitle'),
        tabBarIcon: ({color, size}) => {
          return <Icon source="cog-off-outline" size={size} color={color} />;
        },
      }}
    />
  </Tabs>;
}
