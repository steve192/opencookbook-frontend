import {Picker} from '@react-native-picker/picker';
import {Button, Layout, Text} from '@ui-kitten/components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import Spacer from 'react-spacer';
import {CustomCard} from '../components/CustomCard';
import {Prompt} from '../helper/Prompt';
import {logout} from '../redux/features/authSlice';
import {changeTheme} from '../redux/features/settingsSlice';
import {RootState} from '../redux/store';
import CentralStyles from '../styles/CentralStyles';

export const SettingsScreen = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const dispatch = useDispatch();
  const {t} = useTranslation('translation');

  const deleteAccount = () => {
    Prompt.show();
    // Alert.alert(
    //     t('screens.settings.deleteAccount'),
    //     t('screens.settings.deleteAccountConfirmationQuestion'), [
    //       {
    //         text: t('common.cancel'),
    //         onPress: () => console.log('Cancel Pressed'),
    //         style: 'cancel',
    //       },
    //       {
    //         text: t('common.delete'),
    //         onPress: () => console.log('OK Pressed'),
    //         style: 'destructive',
    //       },
    //     ] );
  };
  return (
    <>
      <Layout style={[CentralStyles.fullscreen]}>
        <View style={CentralStyles.contentContainer}>
          <ScrollView>
            <CustomCard>
              <Button onPress={() => dispatch(logout())}>Logout</Button>
            </CustomCard>
            <Spacer height={20} />
            <CustomCard>
              <Text category="label">{t('screens.settings.theme')}</Text>
              <Picker
                selectedValue={selectedTheme}
                onValueChange={(value) => dispatch(changeTheme(value))}>
                <Picker.Item label={t('screens.settings.light')} value="light" />
                <Picker.Item label={t('screens.settings.dark')} value="dark" />
              </Picker>
            </CustomCard>
            <Spacer height={20} />
            <View style={{padding: 10, borderWidth: 1, borderRadius: 16, borderColor: 'red'}}>
              <Text category="label" status="danger">{t('screens.settings.dangerZone')}</Text>
              <Spacer height={20} />
              <Button onPress={deleteAccount} status="danger">{t('screens.settings.deleteAccount')}</Button>
            </View>
          </ScrollView>
        </View>
      </Layout>
    </>
  );
};
