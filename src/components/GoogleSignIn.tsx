import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Divider, Text} from 'react-native-paper';
import {useSignInWithGoogleMutation} from '../api/endpoints/account';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {googleClientId, useGoogleIdToken} from '../helper/googleSignIn';
import {useInstanceFeatures} from '../helper/useInstanceFeatures';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {login} from '../redux/features/authSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';
import {FormErrorMessage} from './FormErrorMessage';
import {useLegalDocumentLinks} from './LegalLinks';

interface Props {
  /** The invitation an account is created with when the address has none yet. */
  invitation?: string;
}

/**
 * "Continue with Google", when the instance offers it on this platform. Signs in to the account of
 * the address, or creates it, which accepts the terms the notice under the button names.
 *
 * @param {Props} props the invitation, if any
 * @return {JSX.Element | null} the button, or nothing
 */
export const GoogleSignIn = ({invitation}: Props) => {
  const clientId = googleClientId(useInstanceFeatures().googleSignIn);
  return clientId ? <GoogleSignInButton clientId={clientId} invitation={invitation} /> : null;
};

const GoogleSignInButton = ({clientId, invitation}: Props & {clientId: string}) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<BaseNavigatorProps>>();
  const legalLinks = useLegalDocumentLinks();
  const [signIn, {isLoading}] = useSignInWithGoogleMutation();
  const [errorMessage, setErrorMessage] = useState<string>();

  const finish = (idToken: string, startedWith?: string) => {
    setErrorMessage(undefined);
    signIn({idToken, invitation: startedWith}).unwrap()
        .then(() => {
          dispatch(login());
          navigation.navigate('default');
        })
        .catch((error) => setErrorMessage(t(errorMessageKey(error))));
  };
  const google = useGoogleIdToken(clientId, invitation, finish);

  return (
    <>
      <View style={styles.or}>
        <Divider style={styles.line} />
        <Text style={styles.orText}>{t('screens.login.google.or')}</Text>
        <Divider style={styles.line} />
      </View>
      <Button
        testID='googleSignIn'
        mode="outlined"
        icon="google"
        textColor="white"
        style={CentralStyles.elementSpacing}
        loading={isLoading}
        disabled={!google.ready || isLoading}
        onPress={google.start}>
        {t('screens.login.google.continue')}
      </Button>
      <Text style={styles.terms}>
        <Trans t={t} i18nKey="screens.login.google.terms" components={legalLinks} />
      </Text>
      <FormErrorMessage testID='googleSignInError' message={errorMessage} />
    </>
  );
};

const styles = StyleSheet.create({
  or: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  line: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  orText: {
    color: 'white',
    marginHorizontal: 10,
  },
  terms: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
});
