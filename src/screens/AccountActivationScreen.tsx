import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useActivateAccountMutation} from '../api/endpoints/account';
import {hasStoredSignIn} from '../api/session';
import {SuccessErrorBanner} from '../components/SuccessErrorBanner';
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
  const [activateAccount] = useActivateAccountMutation();

  useEffect(() => {
    if (!props.route.params?.activationId) {
      setActivationError(true);
      return;
    }

    const activationTimer = setTimeout(() => {
      activateAccount(props.route.params.activationId).unwrap().then(() => {
        setActivationSuccess(true);
        dispatch(login());
        props.navigation.navigate('default');
      }).catch(async () => {
        // A deep link can mount this screen twice, and the second one finds the link spent by the first.
        if (await hasStoredSignIn()) {
          dispatch(login());
          props.navigation.navigate('default');
        } else {
          setActivationError(true);
        }
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
