import {Picker} from '@react-native-picker/picker';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Appbar, Button, Caption, Divider, Text, useTheme} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import Spacer from 'react-spacer';
import {HardDriveIcon} from '../assets/Icons';
import {CustomCard} from '../components/CustomCard';
import Configuration from '../Configuration';
import RestAPI from '../dao/RestAPI';
import {PromptUtil} from '../helper/Prompt';
import {logout} from '../redux/features/authSlice';
import {changeTheme} from '../redux/features/settingsSlice';
import {RootState} from '../redux/store';
import CentralStyles from '../styles/CentralStyles';

export const SettingsScreen = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const backendUrl = useSelector((state: RootState) => state.settings.backendUrl);
  const dispatch = useDispatch();
  const {t} = useTranslation('translation');
  const theme = useTheme();

  const deleteAccount = () => {
    PromptUtil.show({
      title: t('screens.settings.deleteAccount'),
      message: t('screens.settings.deleteAccountConfirmationQuestion'),
      button1: t('common.delete'),
      button1Callback: () => {
        RestAPI.deleteAccount();
        dispatch(logout());
      },
      button2: t('common.cancel'),
    });
  };
  return (
    <>
      <View style={[CentralStyles.fullscreen]}>
        <Appbar.Header>
          <Appbar.Content color={theme.colors.textOnPrimary} title={t('screens.settings.screenTitle')}/>
        </Appbar.Header>
        <View style={CentralStyles.contentContainer}>
          <ScrollView>
            <HardDriveIcon style={{alignSelf: 'center', width: 100, height: 100}}/>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{backendUrl}</Text>
            <Divider style={{marginTop: 10, marginBottom: 10}}/>
            <Button
              mode='outlined'
              onPress={() => {
                Configuration.setAuthToken('');
                Configuration.setRefreshToken('');
                dispatch(logout());
              }}>Logout</Button>
            <Spacer height={20} />
            <CustomCard>
              <Caption>{t('screens.settings.theme')}</Caption>
              <Picker
                selectedValue={selectedTheme}
                onValueChange={(value) => dispatch(changeTheme(value))}>
                <Picker.Item label={t('screens.settings.light')} value="light" />
                <Picker.Item label={t('screens.settings.dark')} value="dark" />
              </Picker>
            </CustomCard>
            <Spacer height={20} />
            <View style={{padding: 10, borderWidth: 1, borderRadius: 16, borderColor: 'red'}}>
              <Caption style={{color: theme.colors.error}}>{t('screens.settings.dangerZone')}</Caption>
              <Spacer height={20} />
              <Button icon="alert-circle-outline" mode="contained" color={theme.colors.error} onPress={deleteAccount}>{t('screens.settings.deleteAccount')}</Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};
