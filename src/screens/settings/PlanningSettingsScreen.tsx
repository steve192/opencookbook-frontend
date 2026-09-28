import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import AppPersistence from '../../AppPersistence';
import {CustomCard} from '../../components/CustomCard';
import {SwitchRow} from '../../components/SwitchRow';
import {usePersistedFlag} from '../../helper/usePersistedFlag';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'PlanningSettingsScreen'>;

export const PlanningSettingsScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  // Turned off from the question itself after an import; turned back on here
  const [askPlanningDetails, setAskPlanningDetails] = usePersistedFlag(
      AppPersistence.getAskForPlanningDetails, AppPersistence.setAskForPlanningDetails, true);

  return (
    <SettingsPage>
      <CustomCard>
        <SwitchRow
          label={t('screens.settings.askPlanningDetails')}
          value={askPlanningDetails}
          onChange={setAskPlanningDetails} />
      </CustomCard>
    </SettingsPage>
  );
};
