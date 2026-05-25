import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, View} from 'react-native';
import {Button, Caption, HelperText, Surface, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {importRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


type Props = NativeStackScreenProps<MainNavigationProps, 'ImportScreen'>;

// Extracts the first http(s) URL from a free-form pasted string (people often
// share recipe URLs with surrounding text).
const extractUrl = (input: string): string => {
  const matches = /((https?):\S+)/.exec(input);
  return matches?.[1] ?? '';
};

export const ImportScreen = (props: Props) => {
  const [importURL, setImportURL] = useState<string>('');
  const [importPending, setImportPending] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();

  const extracted = extractUrl(importURL);
  const canImport = !importPending && extracted.length > 0;

  const startImport = () => {
    if (!canImport) return;
    setImportPending(true);
    setImportSuccess(false);
    setImportError('');

    dispatch(importRecipe(extracted)).unwrap().then(() => {
      setImportError('');
      setImportSuccess(true);
      setImportURL('');
    }).catch((error: AxiosError) => {
      if (error.response?.status === 501) {
        setImportError(t('screens.import.notSupported'));
        return;
      }
      setImportError(error.toString());
    }).finally(() => setImportPending(false));
  };

  const renderNativeOnlySection = () => (
    <>
      <Spacer height={40} />
      <Caption style={{textAlign: 'center'}}>{t('common.or')}</Caption>
      <Spacer height={80} />
      <Button onPress={() => props.navigation.navigate('RecipeImportBrowser')}>
        {t('screens.import.startRecipeBrowser')}
      </Button>
    </>
  );

  return (
    <Surface style={CentralStyles.fullscreen}>
      <View style={CentralStyles.contentContainer}>
        <TextInput
          label={t('screens.import.URLToImport')}
          value={importURL}
          onChangeText={setImportURL}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='url'
          autoComplete='url'
          returnKeyType='go'
          onSubmitEditing={startImport} />
        <Spacer height={10} />
        <Button
          buttonColor={importError.length > 0 ? theme.colors.error : theme.colors.primary}
          icon={importSuccess ? 'check' : importError.length > 0 ? 'alert-circle-outline' : undefined}
          mode="contained"
          loading={importPending}
          disabled={!canImport}
          onPress={startImport}>
          {t('screens.import.import')}
        </Button>
        <Spacer height={80} />
        <View style={{flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
          {importError.length > 0 &&
            <HelperText type='error'>{t('screens.import.importFailed')} {importError}</HelperText>
          }
          {importSuccess &&
            <Text style={{color: theme.colors.success}}>{t('screens.import.importSuccess')}</Text>
          }
        </View>
        {Platform.OS !== 'web' && renderNativeOnlySection()}
      </View>
    </Surface>
  );
};
