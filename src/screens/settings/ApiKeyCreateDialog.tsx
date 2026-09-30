import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {Button, Checkbox, Dialog, Portal, Text, TextInput} from 'react-native-paper';
import RestAPI, {ApiScope, IssuedApiKey} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {API_SCOPE_GROUPS, scopeLabelKey, toggleScope} from '../../helper/apiScopes';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {overlayStyles} from '../../styles/CentralStyles';

const NAME_MAX_LENGTH = 60;

interface Props {
  onDismiss: () => void;
  onCreated: (key: IssuedApiKey) => void;
}

export const ApiKeyCreateDialog = ({onDismiss, onCreated}: Props) => {
  const {t} = useTranslation('translation');
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<ApiScope[]>([]);
  const [saving, setSaving] = useState(false);

  const create = () => {
    setSaving(true);
    RestAPI.createApiKey(name.trim(), scopes)
        .then(onCreated)
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}))
        .finally(() => setSaving(false));
  };

  return (
    <Portal>
      <Dialog visible style={overlayStyles.dialogView} onDismiss={onDismiss}>
        <Dialog.Title>{t('screens.apiKeys.create')}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={styles.content}>
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
            disabled={saving || name.trim() === '' || scopes.length === 0}>
            {t('common.create')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  content: {gap: 8, paddingVertical: 8},
  label: {textAlign: 'left'},
});
