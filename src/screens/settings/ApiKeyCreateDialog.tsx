import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {Button, Checkbox, Dialog, Text, TextInput} from 'react-native-paper';
import {useCreateApiKeyMutation} from '../../api/endpoints/account';
import {ApiScope, IssuedApiKey} from '../../api/types/account';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {API_SCOPE_GROUPS, scopeLabelKey, toggleScope} from '../../helper/apiScopes';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {withPortal} from '../../helper/withPortal';
import {OfflineSaveHint} from '../../offline/OfflineSaveHint';
import {useIsOnline} from '../../offline/useIsOnline';
import {overlayStyles} from '../../styles/CentralStyles';

const NAME_MAX_LENGTH = 60;

interface Props {
  onDismiss: () => void;
  onCreated: (key: IssuedApiKey) => void;
}

export const ApiKeyCreateDialog = withPortal(function ApiKeyCreateDialog({onDismiss, onCreated}: Props) {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<ApiScope[]>([]);
  const [createApiKey, {isLoading: saving}] = useCreateApiKeyMutation();

  const create = () => {
    createApiKey({name: name.trim(), scopes}).unwrap()
        .then(onCreated)
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  return (
    <Dialog visible style={overlayStyles.dialogView} onDismiss={onDismiss}>
      <Dialog.Title>{t('screens.apiKeys.create')}</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView contentContainerStyle={styles.content}>
          <OfflineSaveHint />
          <TextInput mode="outlined" label={t('screens.apiKeys.name')} value={name} onChangeText={setName}
            maxLength={NAME_MAX_LENGTH} />
          {API_SCOPE_GROUPS.map((group) => (
            <React.Fragment key={group.labelKey}>
              <Text variant="titleSmall">{t(group.labelKey)}</Text>
              {group.scopes.map((scope) => (
                <Checkbox.Item key={scope} mode="android" position="leading" labelStyle={styles.label}
                  label={t(scopeLabelKey(scope))}
                  status={scopes.includes(scope) ? 'checked' : 'unchecked'}
                  onPress={() => setScopes(toggleScope(scopes, scope))} />
              ))}
            </React.Fragment>
          ))}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss}>{t('common.cancel')}</Button>
        <Button onPress={create} loading={saving}
          disabled={saving || !online || name.trim() === '' || scopes.length === 0}>
          {t('common.create')}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
});

const styles = StyleSheet.create({
  content: {gap: 8, paddingVertical: 8},
  label: {textAlign: 'left'},
});
