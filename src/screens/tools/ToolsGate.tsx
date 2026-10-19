import {useLinkTo} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from 'react-native-paper';
import {useGetInstanceInfoQuery} from '../../api/endpoints/account';
import {LoadingScreen} from '../../components/LoadingScreen';
import {Notice} from '../../components/Notice';
import {instanceFeatures} from '../../helper/instanceFeatures';
import {selectLoggedIn} from '../../redux/features/authSlice';
import {useAppSelector} from '../../redux/hooks';
import {PageFrame} from '../../components/PageFrame';

// The tools need an account unless the instance offers them to everybody.
export const ToolsGate = ({children}: {children: React.ReactNode}) => {
  const {t} = useTranslation('translation');
  const linkTo = useLinkTo();
  const loggedIn = useAppSelector(selectLoggedIn);
  const instanceInfo = useGetInstanceInfoQuery(undefined, {skip: loggedIn});

  if (loggedIn || instanceFeatures(instanceInfo.data).toolsPublic) {
    return <>{children}</>;
  }
  if (instanceInfo.isLoading) {
    return <LoadingScreen />;
  }
  return (
    <PageFrame>
      <Notice icon="account-lock-outline" tone="information">{t('tools.signInRequired')}</Notice>
      <Button mode="contained" onPress={() => linkTo('/login')}>{t('tools.signupHint.signIn')}</Button>
    </PageFrame>
  );
};
