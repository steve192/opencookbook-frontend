import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import AppPersistence from '../../AppPersistence';
import {CustomCard} from '../../components/CustomCard';
import {SwitchRow} from '../../components/SwitchRow';
import RestAPI from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {usePersistedFlag} from '../../helper/usePersistedFlag';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'ScanningSettingsScreen'>;

export const ScanningSettingsScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  // Recorded per submission, so switching this off stops future scans being kept but says
  // nothing about the ones already donated, which is what the deletion below is for.
  const [scanTrainingConsent, setScanTrainingConsent] = usePersistedFlag(
      AppPersistence.getScanTrainingConsent, AppPersistence.setScanTrainingConsent, false);

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

  return (
    <SettingsPage>
      <CustomCard style={styles.card}>
        <SwitchRow
          label={t('screens.settings.scanTrainingConsent')}
          explanation={t('screens.settings.scanTrainingConsentExplanation')}
          value={scanTrainingConsent}
          onChange={setScanTrainingConsent} />
      </CustomCard>
      <Button mode="outlined" icon="delete-outline" onPress={onDeleteScanDataPress}>
        {t('screens.settings.deleteScanData')}
      </Button>
    </SettingsPage>
  );
};

const styles = StyleSheet.create({
  card: {gap: 10},
});
