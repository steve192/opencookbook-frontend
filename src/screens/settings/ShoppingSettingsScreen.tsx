import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {SwitchRow} from '../../components/SwitchRow';
import {CustomCard} from '../../components/CustomCard';
import {ShoppingProvider} from '../../api/types/shopping';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {useShoppingSettings} from '../../helper/shopping/useShoppingSettings';
import {useIsOnline} from '../../offline/useIsOnline';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {SettingsEntry} from './SettingsEntry';
import {PageFrame} from '../../components/PageFrame';
import {SettingsHint} from './SettingsHint';

type Props = NativeStackScreenProps<MainNavigationProps, 'ShoppingSettingsScreen'>;

export const ShoppingSettingsScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const shopping = useShoppingSettings();
  const online = useIsOnline();

  const failed = (error: unknown) => SnackbarUtil.show({message: t(errorMessageKey(error))});

  const onProviderChange = (provider: string) => {
    shopping.chooseProvider(provider as ShoppingProvider).catch(failed);
  };

  return (
    <PageFrame>
      <CustomCard style={styles.card}>
        <SettingsHint>{t('screens.shopping.provider.setting')}</SettingsHint>
        <SegmentedButtons
          value={shopping.provider ?? ''}
          onValueChange={onProviderChange}
          buttons={[
            {value: 'COOKPAL', label: t('screens.shopping.provider.cookpal'), icon: 'cart-outline', disabled: !online},
            {value: 'BRING', label: t('screens.shopping.provider.bring'), disabled: !online},
          ]} />
        <SettingsHint>{t('screens.shopping.provider.settingExplanation')}</SettingsHint>
      </CustomCard>
      <CustomCard style={styles.card}>
        <SwitchRow
          label={t('screens.shopping.suggestions.setting')}
          explanation={t('screens.shopping.suggestions.settingExplanation')}
          value={shopping.suggestions}
          disabled={!online}
          onChange={(shown) => shopping.showSuggestions(shown).catch(failed)} />
      </CustomCard>
      <SettingsEntry
        title={t('screens.shopping.regulars.title')}
        subtitle={t('screens.shopping.regulars.subtitle')}
        icon="calendar-sync-outline"
        onPress={() => props.navigation.navigate('RegularsScreen')} />
      <SettingsEntry
        title={t('screens.shopping.staplesTitle')}
        subtitle={t('screens.shopping.staplesSubtitle')}
        icon="home-outline"
        onPress={() => props.navigation.navigate('StaplesScreen')} />
    </PageFrame>
  );
};

const styles = StyleSheet.create({
  card: {gap: 10},
});
