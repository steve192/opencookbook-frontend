import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
import RestAPI from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {login, logout} from '../redux/features/authSlice';
import {useAppDispatch} from '../redux/hooks';
import {LoginBackdrop} from './LoginScreen/LoginBackdrop';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'AccountActivationScreen'>;
export const AccountActivationScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const [activationError, setActivationError] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);


  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!props.route.params?.activationId) {
      setActivationError(true);
      return;
    }

    const activationTimer = setTimeout(() => {
      RestAPI.activateAccount(props.route.params.activationId).then(() => {
        setActivationSuccess(true);
        dispatch(login());
        props.navigation.navigate('default');
      }).catch(() => {
        // Sometimes when this sceeen is accessed via deep links, the activity is mounted twice.
        // In this case the activation link is already expired. Check if the user is logged in

        RestAPI.getUserInfo().then((userinfo) => {
          if (userinfo.email) {
            console.info('got userinfo, logging in');
            dispatch(login());
            props.navigation.navigate('default');
          }
        }).catch((error) => {
          console.error('Login failed', error);
          dispatch(logout());
          setActivationError(true);
        });
      });
    }, 1000);

    return (() => clearTimeout(activationTimer));
  }, [props.route.params.activationId]);

  return (
    <LoginBackdrop>
      <SuccessErrorBanner
        error={activationError}
        success={activationSuccess}
        pending={!activationError && !activationSuccess}
        pendingContent={t('screens.accountActivationScreen.processing')}
        errorContent={t('screens.accountActivationScreen.error')}
        successContent={t('screens.accountActivationScreen.success')}
      />
    </LoginBackdrop>
  );
};
