import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Text} from 'react-native-paper';
import {useGetApiKeysQuery, useRevokeApiKeyMutation} from '../../api/endpoints/account';
import {ApiKey, IssuedApiKey} from '../../api/types/account';
import {QueryFallback} from '../../components/QueryFallback';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {scopeLabelKey} from '../../helper/apiScopes';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles from '../../styles/CentralStyles';
import {ApiKeyCreateDialog} from './ApiKeyCreateDialog';
import {ApiKeyCreatedDialog} from './ApiKeyCreatedDialog';
import {SettingsHint, SettingsPage} from './SettingsPage';

type Props = NativeStackScreenProps<MainNavigationProps, 'ApiKeysScreen'>;

export const ApiKeysScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const {data: keys, error, refetch} = useGetApiKeysQuery();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedApiKey>();

  const revoke = (key: ApiKey) => PromptUtil.show({
    title: t('screens.apiKeys.revokeTitle'),
    message: t('screens.apiKeys.revokeMessage', {name: key.name}),
    destructive: true,
    confirm: t('screens.apiKeys.revoke'),
    cancel: t('common.cancel'),
    onConfirm: () => {
      revokeApiKey(key.id).unwrap()
          .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
    },
  });

  const onCreated = (key: IssuedApiKey) => {
    setCreating(false);
    setIssued(key);
  };

  if (!keys) {
    return <QueryFallback error={error} onRetry={refetch} />;
  }

  return (
    <SettingsPage>
      <SettingsHint>{t('screens.apiKeys.explanation')}</SettingsHint>
      {keys.length === 0 && <Text>{t('screens.apiKeys.empty')}</Text>}
      {keys.map((key) => <ApiKeyCard key={key.id} apiKey={key} canRevoke={online} onRevoke={() => revoke(key)} />)}
      <Button mode="contained" icon="key-plus" disabled={!online} onPress={() => setCreating(true)}>
        {t('screens.apiKeys.create')}
      </Button>
      {creating && <ApiKeyCreateDialog onDismiss={() => setCreating(false)} onCreated={onCreated} />}
      {issued && <ApiKeyCreatedDialog issued={issued} onDismiss={() => setIssued(undefined)} />}
    </SettingsPage>
  );
};

const ApiKeyCard = ({apiKey, canRevoke, onRevoke}: {apiKey: ApiKey, canRevoke: boolean, onRevoke: () => void}) => {
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
        <Button icon="key-remove" disabled={!canRevoke} onPress={onRevoke}>{t('screens.apiKeys.revoke')}</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {gap: 8},
});
