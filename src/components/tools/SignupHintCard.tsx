import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, Card, IconButton, Text} from 'react-native-paper';
import {useInstanceFeatures} from '../../helper/useInstanceFeatures';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import {selectLoggedIn} from '../../redux/features/authSlice';
import {signupHintDismissed} from '../../redux/features/toolsSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';

const QUIET_FOR = 30 * 24 * 60 * 60 * 1000;

// For somebody using a tool without an account: what CookPal does besides, said once and quietly.
export const SignupHintCard = () => {
  const {t} = useTranslation('translation');
  // Pushed, so going back returns to the tool rather than to the login stack beneath it.
  const navigation = useNavigation<NativeStackNavigationProp<BaseNavigatorProps>>();
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(selectLoggedIn);
  const dismissedAt = useAppSelector((state) => state.tools.signupHintDismissedAt);
  const {signupMode} = useInstanceFeatures();

  if (loggedIn || (dismissedAt != null && Date.now() - dismissedAt < QUIET_FOR)) {
    return null;
  }
  const open = signupMode === 'OPEN';
  return (
    <Card mode="outlined">
      <Card.Title
        title={t('tools.signupHint.title')}
        right={(props) => (
          <IconButton {...props} icon="close" accessibilityLabel={t('tools.signupHint.dismiss')}
            onPress={() => dispatch(signupHintDismissed(Date.now()))} />
        )} />
      <Card.Content>
        <Text variant="bodyMedium">{t(open ? 'tools.signupHint.body' : 'tools.signupHint.bodySignInOnly')}</Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={() => navigation.push('default', {screen: 'LoginScreen'})}>{t('tools.signupHint.signIn')}</Button>
        {open && <Button mode="contained"
          onPress={() => navigation.push('default', {screen: 'SignupScreen'})}>{t('tools.signupHint.signUp')}</Button>}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  actions: {flexWrap: 'wrap'},
});
