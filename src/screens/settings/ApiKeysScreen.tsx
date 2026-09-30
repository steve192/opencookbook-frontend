import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card, Chip, Text} from 'react-native-paper';
import RestAPI, {ApiKey, IssuedApiKey} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {scopeLabelKey} from '../../helper/apiScopes';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {ApiKeyCreateDialog} from './ApiKeyCreateDialog';
import {ApiKeyCreatedDialog} from './ApiKeyCreatedDialog';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'ApiKeysScreen'>;

export const ApiKeysScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const [keys, setKeys] = useState<ApiKey[]>();
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedApiKey>();

  const load = useCallback(() => {
    RestAPI.getApiKeys()
        .then(setKeys)
        .catch((error) => {
          setKeys([]);
          SnackbarUtil.show({message: t(errorMessageKey(error))});
        });
  }, [t]);

  useFocusEffect(load);

  const revoke = (key: ApiKey) => PromptUtil.show({
    title: t('screens.apiKeys.revokeTitle'),
    message: t('screens.apiKeys.revokeMessage', {name: key.name}),
    destructive: true,
    confirm: t('screens.apiKeys.revoke'),
    cancel: t('common.cancel'),
    onConfirm: () => {
      RestAPI.revokeApiKey(key.id)
          .then(load)
          .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
    },
  });

  const onCreated = (key: IssuedApiKey) => {
    setCreating(false);
    setIssued(key);
    load();
  };

  return (
    <SettingsPage>
      <SettingsHint>{t('screens.apiKeys.explanation')}</SettingsHint>
      {keys === undefined && <ActivityIndicator />}
      {keys?.length === 0 && <Text>{t('screens.apiKeys.empty')}</Text>}
      {keys?.map((key) => <ApiKeyCard key={key.id} apiKey={key} onRevoke={() => revoke(key)} />)}
      <Button mode="contained" icon="key-plus" onPress={() => setCreating(true)}>
        {t('screens.apiKeys.create')}
      </Button>
      {creating && <ApiKeyCreateDialog onDismiss={() => setCreating(false)} onCreated={onCreated} />}
      {issued && <ApiKeyCreatedDialog issued={issued} onDismiss={() => setIssued(undefined)} />}
    </SettingsPage>
  );
};

const ApiKeyCard = ({apiKey, onRevoke}: {apiKey: ApiKey, onRevoke: () => void}) => {
  const {t, i18n} = useTranslation('translation');
  const lastUsed = apiKey.lastUsedAt ?
    t('screens.apiKeys.lastUsed', {date: new Date(apiKey.lastUsedAt).toLocaleString(i18n.language)}) :
    t('screens.apiKeys.neverUsed');

  return (
    <Card>
      <Card.Title title={apiKey.name} subtitle={`${apiKey.displayPrefix}…`} />
      <Card.Content style={styles.content}>
        <View style={CentralStyles.chipRow}>
          {apiKey.scopes.map((scope) => <Chip compact key={scope}>{t(scopeLabelKey(scope))}</Chip>)}
        </View>
        <SettingsHint>
          {t('screens.apiKeys.created', {date: new Date(apiKey.createdOn).toLocaleDateString(i18n.language)})}
          {' · '}
          {lastUsed}
        </SettingsHint>
      </Card.Content>
      <Card.Actions>
        <Button icon="key-remove" onPress={onRevoke}>{t('screens.apiKeys.revoke')}</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {gap: 8},
});
