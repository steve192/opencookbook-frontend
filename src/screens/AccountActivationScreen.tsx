import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import RestAPI from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';
import {LoginBackdrop} from './LoginScreen/LoginBackdrop';
import {Colors, ProgressBar, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'AccountActivationScreen'>;
export const AccountActivationScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const [activationError, setActivationError] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    if (!props.route.params?.activationId) {
      setActivationError(true);
      return;
    }

    RestAPI.activateAccount(props.route.params.activationId).then(() => {
      setActivationSuccess(true);
    }).catch(() => {
      setActivationError(true);
    });
  });

  const renderActivationPending =
    <>
      <Text style={{fontWeight: 'bold', color: Colors.white, textAlign: 'center'}}>{t('screens.accountActivationScreen.processing')}</Text>
      <Spacer height={20}/>
      <View style={{maxWidth: 300, width: '100%', alignSelf: 'center', justifyContent: 'center'}}>
        <ProgressBar indeterminate={true} />
      </View>
    </>;

  const renderActivationError =
    <>
      <Icon style={{textAlign: 'center'}} name="exclamation-circle" size={30} color={Colors.red500} />
      <Spacer height={20}/>
      <Text style={{fontWeight: 'bold', color: Colors.red500, textAlign: 'center'}}>{t('screens.accountActivationScreen.error')}</Text>
    </>;
  const renderActivationSuccess =
    <>
      <Icon style={{textAlign: 'center'}} name="check-circle" size={30} color={Colors.green500} />
      <Spacer height={20}/>
      <Text style={{fontWeight: 'bold', color: Colors.green500, textAlign: 'center'}}>{t('screens.accountActivationScreen.success')}</Text>
    </>;

  return (
    <LoginBackdrop>
      <View style={{flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>

        <View style={CentralStyles.contentContainer}>
          {!activationError && !activationSuccess && renderActivationPending }
          {activationError && renderActivationError }
          {activationSuccess && renderActivationSuccess }
        </View>
      </View>
    </LoginBackdrop>
  );
};

