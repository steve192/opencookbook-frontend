import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
import RestAPI from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {login} from '../redux/features/authSlice';
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

    RestAPI.activateAccount(props.route.params.activationId).then(() => {
      setActivationSuccess(true);
      dispatch(login());
      props.navigation.navigate('default');
    }).catch(() => {
      setActivationError(true);
    });
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
