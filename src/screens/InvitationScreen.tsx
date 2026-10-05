import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Text} from 'react-native-paper';
import {Notice} from '../components/Notice';
import {SignupForm} from '../components/SignupForm';
import {useAppLinkOrigin} from '../helper/useAppLinkOrigin';
import {isSameInstance} from '../helper/instanceAddress';
import {LINK_SEGMENTS} from '../helper/appLink';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {selectLoggedIn} from '../redux/features/authSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {signOut, switchServer} from '../redux/sessionThunks';
import CentralStyles from '../styles/CentralStyles';
import {LoginBackdrop, LoginColumn} from './LoginScreen/LoginBackdrop';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'InvitationScreen'>;

/**
 * Creating an account with an invitation link.
 *
 * Outside the signed in part of the app because the invited have no account yet. The link may be
 * for another instance than the one the app talks to; the app follows it, as there is nothing to
 * lose while nobody is signed in.
 *
 * @param {Props} props the invitation the screen was opened for
 * @return {JSX.Element} the sign up form, or what stands in its way
 */
export const InvitationScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(selectLoggedIn);
  const backendUrl = useAppSelector((state) => state.settings.backendUrl);
  const token = props.route.params.token;
  const linkOrigin = useAppLinkOrigin(LINK_SEGMENTS.invitation, token);

  // Not before the stored address has been read: it would be overwritten by it.
  const elsewhere = !!linkOrigin && !!backendUrl && !isSameInstance(linkOrigin, backendUrl);

  useEffect(() => {
    if (elsewhere && !loggedIn) {
      dispatch(switchServer(linkOrigin))
          .catch((error) => console.error('Following the invitation to its instance failed', error));
    }
  }, [elsewhere, loggedIn, linkOrigin]);

  // The new account is for the instance the link names, which is only the one in use once the switch is done.
  const ready = !loggedIn && !elsewhere;

  return (
    <LoginBackdrop>
      <LoginColumn>
        <Text style={CentralStyles.loginTitle}>
          {t('screens.login.invitation.title', {instance: instanceName(backendUrl, linkOrigin)})}
        </Text>
        {loggedIn &&
          <>
            <Notice icon="account-alert-outline" tone="information">{t('screens.login.invitation.signedIn')}</Notice>
            <Button mode="contained" onPress={() => dispatch(signOut())}>
              {t('screens.login.invitation.signOut')}
            </Button>
          </>
        }
        {ready &&
          <SignupForm
            invitation={token}
            onSignedUp={(emailAddress) => props.navigation.reset({
              index: 0,
              routes: [{name: 'default', state: {routes: [{name: 'LoginScreen', params: {emailAddress}}]}}],
            })} />
        }
      </LoginColumn>
    </LoginBackdrop>
  );
};

// What the title names: the host of the instance the account is created on.
const instanceName = (backendUrl: string, linkOrigin?: string): string =>
  (linkOrigin ?? backendUrl).replace(/^https?:\/\//i, '');
