import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import RestAPI from '../../dao/RestAPI';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop} from './LoginBackdrop';
import {Button, Colors, ProgressBar, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'RequestPasswordResetScreen'>;
export const RequestPasswordResetScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  useEffect(() => {


  }, []);


  return (
    <LoginBackdrop>
      <View style={{flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>

        <View style={CentralStyles.contentContainer}>
          <Text style={{color: Colors.white}}>{t('screens.resetPassword.description')}</Text>
          <TextInput
            dense={true}
            label={t('common.emailAddress')}/>
          <Button
            mode='contained'
          >{t('screens.resetPassword.resetPassword')}</Button>
        </View>
      </View>
    </LoginBackdrop>
  );
};

