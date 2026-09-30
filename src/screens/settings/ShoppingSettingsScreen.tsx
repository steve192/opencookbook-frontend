import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {CustomCard} from '../../components/CustomCard';
import {ShoppingProvider} from '../../api/types/shopping';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {useShoppingProvider} from '../../helper/shopping/useShoppingProvider';
import {useIsOnline} from '../../offline/useIsOnline';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {SettingsEntry} from './SettingsEntry';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'ShoppingSettingsScreen'>;

export const ShoppingSettingsScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const shopping = useShoppingProvider();
  const online = useIsOnline();

  const onProviderChange = (provider: string) => {
    shopping.choose(provider as ShoppingProvider)
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  return (
    <SettingsPage>
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
      <SettingsEntry
        title={t('screens.shopping.staplesTitle')}
        subtitle={t('screens.shopping.staplesSubtitle')}
        icon="home-outline"
        onPress={() => props.navigation.navigate('StaplesScreen')} />
    </SettingsPage>
  );
};

const styles = StyleSheet.create({
  card: {gap: 10},
});
