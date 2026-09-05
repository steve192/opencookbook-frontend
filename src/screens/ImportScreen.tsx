import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AxiosError} from 'axios';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Chip, Divider, HelperText, Icon, List, Surface, Text, TextInput} from 'react-native-paper';
import RestAPI, {Recipe} from '../dao/RestAPI';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {importRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


type Props = NativeStackScreenProps<MainNavigationProps, 'ImportScreen'>;

// Extracts the first http(s) URL from a free-form pasted string (people often
// share recipe URLs with surrounding text).
const extractUrl = (input: string): string => {
  const matches = /((https?):\S+)/.exec(input);
  return matches?.[1] ?? '';
};

export const ImportScreen = (props: Props) => {
  const [importURL, setImportURL] = useState<string>(props.route.params?.importUrl ?? '');
  const [importPending, setImportPending] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | undefined>(undefined);
  const [supportedHosts, setSupportedHosts] = useState<string[]>([]);

  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const ocrImportEnabled = useAppSelector((state) => state.settings.ocrImportEnabled);

  useEffect(() => {
    RestAPI.getAvailableImportHosts()
        .then(setSupportedHosts)
        // The host list is a convenience only, a failure must not block importing
        .catch(() => setSupportedHosts([]));
  }, []);

  // A deep link (e.g. sharing a recipe url into the app) can hand us a url after mount
  useEffect(() => {
    const linkedUrl = props.route.params?.importUrl;
    linkedUrl && setImportURL(linkedUrl);
  }, [props.route.params?.importUrl]);

  const extracted = extractUrl(importURL);
  const urlLooksValid = extracted.length > 0;
  // Only complain about the input once the user actually typed something
  const showInvalidUrlHint = importURL.trim().length > 0 && !urlLooksValid;
  const canImport = !importPending && urlLooksValid;

  const describeError = (error: AxiosError): string => {
    if (error.response?.status === 501) {
      return t('screens.import.notSupported');
    }
    if (!error.response) {
      return t('common.unknownerror');
    }
    return error.message;
  };

  const startImport = () => {
    if (!canImport) return;
    setImportPending(true);
    setImportedRecipe(undefined);
    setImportError('');

    dispatch(importRecipe(extracted)).unwrap().then((recipe) => {
      setImportError('');
      setImportedRecipe(recipe);
      setImportURL('');
    }).catch((error: AxiosError) => {
      setImportError(describeError(error));
    }).finally(() => setImportPending(false));
  };

  const renderResult = () => {
    if (importError.length > 0) {
      return (
        <View style={[styles.resultBanner, {backgroundColor: theme.colors.errorContainer}]}>
          <Icon source="alert-circle-outline" size={24} color={theme.colors.onErrorContainer} />
          <View style={styles.resultTexts}>
            <Text style={{color: theme.colors.onErrorContainer, fontWeight: 'bold'}}>
              {t('screens.import.importFailed')}
            </Text>
            <Text style={{color: theme.colors.onErrorContainer}}>{importError}</Text>
          </View>
        </View>
      );
    }

    if (importedRecipe) {
      return (
        <View style={[styles.resultBanner, {backgroundColor: theme.colors.primaryContainer}]}>
          <Icon source="check-circle-outline" size={24} color={theme.colors.onPrimaryContainer} />
          <View style={styles.resultTexts}>
            <Text style={{color: theme.colors.onPrimaryContainer, fontWeight: 'bold'}}>
              {t('screens.import.importSuccess')}
            </Text>
            <Text numberOfLines={2} style={{color: theme.colors.onPrimaryContainer}}>{importedRecipe.title}</Text>
            <Button
              compact
              onPress={() => importedRecipe.id && props.navigation.navigate('RecipeScreen', {recipeId: importedRecipe.id})}>
              {t('screens.import.openRecipe')}
            </Button>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSupportedServices = () => {
    if (supportedHosts.length === 0) {
      return null;
    }
    return (
      <List.Accordion
        title={t('screens.import.supportedServices')}
        left={(listProps) => <List.Icon {...listProps} icon="check-decagram-outline" />}>
        <View style={styles.chipContainer}>
          <Text style={[styles.sectionDescription, {color: theme.colors.onSurfaceVariant}]}>
            {t('screens.import.supportedServicesDescription')}
          </Text>
          <View style={styles.chips}>
            {supportedHosts.map((host) => (
              <Chip key={host} compact style={styles.chip}>{host}</Chip>
            ))}
          </View>
        </View>
      </List.Accordion>
    );
  };

  // Only offered where the instance can actually read one, so nobody is shown a button that
  // can only ever fail.
  const renderScanSection = () => {
    if (!ocrImportEnabled) {
      return null;
    }
    return (
      <>
        <Divider style={styles.divider} />
        <View style={styles.sectionHeading}>
          <Text variant="titleMedium">{t('screens.import.scanTitle')}</Text>
          {/* Reading a photograph gets things wrong in ways a url import does not. */}
          <Chip compact icon="flask-outline">{t('common.experimental')}</Chip>
        </View>
        <Text style={[styles.sectionDescription, {color: theme.colors.onSurfaceVariant}]}>
          {t('screens.import.scanDescription')}
        </Text>
        <Button
          mode="outlined"
          icon="camera"
          onPress={() => props.navigation.navigate('RecipeScanScreen')}>
          {t('screens.import.startScan')}
        </Button>
      </>
    );
  };

  // The in-app browser needs a webview, which only exists on the native platforms
  const renderBrowserSection = () => (
    <>
      <Divider style={styles.divider} />
      <Text variant="titleMedium">{t('screens.import.browserTitle')}</Text>
      <Text style={[styles.sectionDescription, {color: theme.colors.onSurfaceVariant}]}>
        {t('screens.import.browserDescription')}
      </Text>
      <Button
        mode="outlined"
        icon="magnify"
        onPress={() => props.navigation.navigate('RecipeImportBrowser')}>
        {t('screens.import.startRecipeBrowser')}
      </Button>
    </>
  );

  return (
    <Surface style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={CentralStyles.contentContainer}>
          <Text variant="titleMedium">{t('screens.import.title')}</Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.onSurfaceVariant}]}>
            {t('screens.import.description')}
          </Text>

          <TextInput
            label={t('screens.import.URLToImport')}
            value={importURL}
            onChangeText={setImportURL}
            error={showInvalidUrlHint}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='url'
            autoComplete='url'
            returnKeyType='go'
            left={<TextInput.Icon icon="link-variant" />}
            right={importURL.length > 0 ?
              <TextInput.Icon
                icon="close"
                accessibilityLabel={t('screens.import.clearInput')}
                onPress={() => setImportURL('')} /> :
              undefined}
            onSubmitEditing={startImport} />
          {/* Sits directly under the input so the hint points at what it is about */}
          <HelperText type="error" visible={showInvalidUrlHint}>
            {t('screens.import.invalidUrl')}
          </HelperText>

          <Button
            mode="contained"
            icon="import"
            loading={importPending}
            disabled={!canImport}
            onPress={startImport}>
            {importPending ? t('screens.import.importing') : t('screens.import.import')}
          </Button>

          {renderResult()}
          {renderSupportedServices()}
          {renderScanSection()}
          {Platform.OS !== 'web' && renderBrowserSection()}
        </View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionDescription: {
    marginTop: 4,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resultTexts: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  chipContainer: {
    paddingHorizontal: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
