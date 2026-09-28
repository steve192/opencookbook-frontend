import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {RadioButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {CustomCard} from '../../components/CustomCard';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {changeTheme} from '../../redux/features/settingsSlice';
import {RootState} from '../../redux/store';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'AppearanceSettingsScreen'>;

const THEMES = ['system', 'light', 'dark'] as const;

export const AppearanceSettingsScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useDispatch();
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);

  return (
    <SettingsPage>
      <CustomCard>
        <SettingsHint>{t('screens.settings.theme')}</SettingsHint>
        <RadioButton.Group value={selectedTheme} onValueChange={(value) => dispatch(changeTheme(value as typeof THEMES[number]))}>
          {THEMES.map((theme) => (
            <RadioButton.Item key={theme} value={theme} label={t(`screens.settings.${theme}`)} />
          ))}
        </RadioButton.Group>
      </CustomCard>
    </SettingsPage>
  );
};
