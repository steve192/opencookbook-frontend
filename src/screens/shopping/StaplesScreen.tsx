import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {IconButton, List, Surface, Text} from 'react-native-paper';
import RestAPI, {Staple} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {useOnlineGuard} from '../../helper/useOnlineGuard';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoadingScreen} from '../../components/LoadingScreen';

type Props = NativeStackScreenProps<MainNavigationProps, 'StaplesScreen'>;

// What the imports learned you keep at home, each of which can be offered ticked again.
export const StaplesScreen = (_props: Props) => {
  const {t} = useTranslation('translation');
  const requireOnline = useOnlineGuard();
  const [staples, setStaples] = useState<Staple[]>();

  useEffect(() => {
    RestAPI.getStaples().then(setStaples).catch((error) => {
      setStaples([]);
      SnackbarUtil.show({message: t(errorMessageKey(error))});
    });
  }, []);

  const forget = (staple: Staple) => {
    if (!requireOnline()) {
      return;
    }
    RestAPI.forgetStaple(staple.id)
        .then(() => setStaples((current) => current?.filter((other) => other.id !== staple.id)))
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  if (!staples) {
    return <LoadingScreen />;
  }

  return (
    <Surface style={CentralStyles.fullscreen}>
      <ScrollView>
        <Text variant="bodyMedium" style={styles.intro}>
          {staples.length === 0 ? t('screens.shopping.noStaples') : t('screens.shopping.staplesSubtitle')}
        </Text>
        {staples.map((staple) => (
          <List.Item
            key={staple.id}
            title={staple.name}
            right={() => <IconButton icon="close" accessibilityLabel={t('screens.shopping.forgetStaple')}
              onPress={() => forget(staple)} />} />
        ))}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  intro: {margin: 16},
});
