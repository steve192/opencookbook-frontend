import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {List, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useForgetStapleMutation, useGetStaplesQuery} from '../../api/endpoints/shopping';
import {Staple} from '../../api/types/shopping';
import {actionsSide} from '../../components/listSides';
import {QueryFallback} from '../../components/QueryFallback';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles from '../../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'StaplesScreen'>;

// What the imports learned you keep at home, each of which can be offered ticked again.
export const StaplesScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  const {data: staples, error, refetch} = useGetStaplesQuery();
  const [forgetStaple] = useForgetStapleMutation();

  const forget = (staple: Staple) => {
    forgetStaple(staple.id).unwrap()
        .catch((failure) => SnackbarUtil.show({message: t(errorMessageKey(failure))}));
  };

  if (!staples) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  return (
    <Surface style={CentralStyles.screen}>
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom}}>
        <Text variant="bodyMedium" style={styles.intro}>
          {staples.length === 0 ? t('screens.shopping.noStaples') : t('screens.shopping.staplesSubtitle')}
        </Text>
        {staples.map((staple) => (
          <List.Item
            key={staple.id}
            title={staple.name}
            right={actionsSide([
              {icon: 'close', label: t('screens.shopping.forgetStaple'), onPress: () => forget(staple),
                disabled: !online},
            ])} />
        ))}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  intro: {margin: 16},
});
