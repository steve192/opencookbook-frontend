import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {SignupForm} from '../../components/SignupForm';
import {BaseNavigatorProps, LoginNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {LoginBackdrop, LoginColumn} from './LoginBackdrop';

type Props = CompositeScreenProps<
NativeStackScreenProps<LoginNavigationProps, 'SignupScreen'>,
NativeStackScreenProps<BaseNavigatorProps, 'LegalDocumentScreen'>
>;

export const SignupScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  return (
    <LoginBackdrop>
      <LoginColumn>
        <Text testID="signup-title" style={CentralStyles.loginTitle}>{t('screens.login.register')}</Text>
        <SignupForm
          onOpenLegalDocument={(document) => props.navigation.navigate('LegalDocumentScreen', {document})}
          onSignedUp={(emailAddress) => props.navigation.popTo('LoginScreen', {emailAddress})} />
      </LoginColumn>
    </LoginBackdrop>
  );
};
