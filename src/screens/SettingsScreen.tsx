import {Picker} from '@react-native-picker/picker';
import Constants from 'expo-constants';
import {useNavigation} from 'expo-router';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Avatar, Button, Caption, Divider, Surface, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import Spacer from 'react-spacer';
import AppPersistence from '../AppPersistence';
import {CustomCard} from '../components/CustomCard';
import RestAPI from '../dao/RestAPI';
import {PromptUtil} from '../helper/Prompt';
import {logout} from '../redux/features/authSlice';
import {changeTheme} from '../redux/features/settingsSlice';
import {RootState} from '../redux/store';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


export const SettingsScreen = () => {
  const selectedTheme = useSelector((state: RootState) => state.settings.theme);
  const backendUrl = useSelector((state: RootState) => state.settings.backendUrl);
  const dispatch = useDispatch();
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  const navigation = useNavigation();

  useEffect(() => {
    return navigation.addListener('focus', () => {
      navigation.getParent()?.setOptions({
        title: t('screens.settings.screenTitle'),
        headerRight: undefined,
      });
    });
  }, [navigation]);

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
    <Surface style={[CentralStyles.fullscreen]}>
      <View style={CentralStyles.contentContainer}>
        <ScrollView>
          <Avatar.Icon style={{alignSelf: 'center', backgroundColor: 'transparent'}} size={100} color={theme.colors.onSurface} icon="server"/>
          <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{backendUrl}</Text>
          <Spacer height={20} />
          <Button
            mode='outlined'
            onPress={() => {
              AppPersistence.setAuthToken('');
              AppPersistence.setRefreshToken('');
              dispatch(logout());
              dispatch(logout());
            }}>Logout</Button>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
          <Spacer height={20} />
          <CustomCard>
            <Caption>{t('screens.settings.theme')}</Caption>
            <Picker
              selectedValue={selectedTheme}
              onValueChange={(value) => dispatch(changeTheme(value))}>
              <Picker.Item label={t('screens.settings.system')} value="system" />
              <Picker.Item label={t('screens.settings.light')} value="light" />
              <Picker.Item label={t('screens.settings.dark')} value="dark" />
            </Picker>
          </CustomCard>
          <Spacer height={20} />
          <View style={{padding: 10, borderWidth: 1, borderRadius: 16, borderColor: 'red'}}>
            <Caption style={{color: theme.colors.error}}>{t('screens.settings.dangerZone')}</Caption>
            <Spacer height={20} />
            <Button
              dark={true}
              icon="alert-circle-outline"
              mode="contained"
              buttonColor={theme.colors.error}
              onPress={deleteAccount}>
              {t('screens.settings.deleteAccount')}
            </Button>
          </View>
          <Spacer height={20}/>
          <View>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>App version: {Constants.expoConfig?.version}</Text>
          </View>
        </ScrollView>
      </View>
    </Surface>
  );
};
