import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {List} from 'react-native-paper';
import {useForgetStapleMutation, useGetStaplesQuery} from '../../api/endpoints/shopping';
import {Staple} from '../../api/types/shopping';
import {CustomCard} from '../../components/CustomCard';
import {actionsSide} from '../../components/listSides';
import {PageFrame} from '../../components/PageFrame';
import {QueryFallback} from '../../components/QueryFallback';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import {SettingsHint} from '../settings/SettingsHint';

type Props = NativeStackScreenProps<MainNavigationProps, 'StaplesScreen'>;

// What the imports learned you keep at home, each of which can be offered ticked again.
export const StaplesScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const {data: staples, error: loadError, refetch} = useGetStaplesQuery();
  const [forgetStaple] = useForgetStapleMutation();

  const forget = (staple: Staple) => {
    forgetStaple(staple.id).unwrap()
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  if (!staples) {
    return <QueryFallback error={loadError} onRetry={refetch} />;
  }

  return (
    <PageFrame>
      <SettingsHint>
        {staples.length === 0 ? t('screens.shopping.noStaples') : t('screens.shopping.staplesSubtitle')}
      </SettingsHint>
      {staples.length > 0 &&
        <CustomCard>
          {staples.map((staple) => (
            <List.Item
              key={staple.id}
              title={staple.name}
              right={actionsSide([
                {icon: 'close', label: t('screens.shopping.forgetStaple'), onPress: () => forget(staple),
                  disabled: !online},
              ])} />
          ))}
        </CustomCard>}
    </PageFrame>
  );
};
