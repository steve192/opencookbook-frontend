import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useGetAvailableImportHostsQuery} from '../api/endpoints/recipes';
import {useTranslation} from 'react-i18next';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Chip, Divider, HelperText, Icon, List, Surface, Text, TextInput} from 'react-native-paper';
import {Notice} from '../components/Notice';
import {RECEIVES_SHARES, useIncomingShare} from '../helper/incomingShare';
import {MAX_IMPORT_INPUT, SharedContent} from '../helper/sharedContent';
import {useInstanceFeatures} from '../helper/useInstanceFeatures';
import {useRecipeImport} from '../helper/useRecipeImport';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {useIsOnline} from '../offline/useIsOnline';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {SharePreview} from './import/SharePreview';


type Props = NativeStackScreenProps<MainNavigationProps, 'ImportScreen'>;

export const ImportScreen = (props: Props) => {
  const [input, setInput] = useState('');
  const {share, dismiss} = useIncomingShare(props.route.params);
  const {startImport, importing, result} = useRecipeImport({
    // Replaced, as after a scan: saving the draft leads back to the cookbook.
    openDraft: () => props.navigation.replace('RecipeWizardScreen', {hasDraft: true}),
    onSaved: () => setInput(''),
    failureFallback: 'errors.importFailed',
  });
  // The host list is a convenience only; without it importing still works.
  const supportedHosts = useGetAvailableImportHostsQuery().data ?? [];

  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();
  const {ocrImportEnabled} = useInstanceFeatures();

  const tooLong = input.length > MAX_IMPORT_INPUT;
  const canImport = online && !importing && input.trim().length > 0 && !tooLong;

  const importShare = (shared: SharedContent) => {
    dismiss();
    if (shared.kind === 'photos') {
      props.navigation.navigate('RecipeScanScreen', {photoUris: shared.uris});
      return;
    }
    // Into the field, so a failed import can be corrected and tried again.
    setInput(shared.input);
    startImport(shared.input);
  };

  const renderResult = () => {
    if (result?.kind === 'failed') {
      return (
        <View style={[styles.resultBanner, {backgroundColor: theme.colors.errorContainer}]}>
          <Icon source="alert-circle-outline" size={24} color={theme.colors.onErrorContainer} />
          <View style={styles.resultTexts}>
            <Text style={{color: theme.colors.onErrorContainer, fontWeight: 'bold'}}>
              {t('screens.import.importFailed')}
            </Text>
            <Text style={{color: theme.colors.onErrorContainer}}>{t(result.messageKey)}</Text>
          </View>
        </View>
      );
    }

    if (result?.kind === 'saved') {
      const recipeId = result.recipe.id;
      return (
        <View style={[styles.resultBanner, {backgroundColor: theme.colors.primaryContainer}]}>
          <Icon source="check-circle-outline" size={24} color={theme.colors.onPrimaryContainer} />
          <View style={styles.resultTexts}>
            <Text style={{color: theme.colors.onPrimaryContainer, fontWeight: 'bold'}}>
              {t('screens.import.importSuccess')}
            </Text>
            <Text numberOfLines={2} style={{color: theme.colors.onPrimaryContainer}}>{result.recipe.title}</Text>
            <Button
              compact
              onPress={() => recipeId && props.navigation.navigate('RecipeScreen', {recipeId})}>
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

  const renderExplanation = () => (
    <View style={styles.explanation}>
      {RECEIVES_SHARES && <Notice icon="share-variant" tone="information">{t('screens.import.howShare')}</Notice>}
      <Notice icon="content-paste" tone="information">
        {RECEIVES_SHARES ? t('screens.import.howPaste') : t('screens.import.howPasteOnly')}
      </Notice>
    </View>
  );

  const renderImport = () => (
    <>
      {renderExplanation()}

      <TextInput
        label={t('screens.import.input')}
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={4}
        contentStyle={styles.inputContent}
        error={tooLong}
        autoCapitalize='none'
        autoCorrect={false}
        right={input.length > 0 ?
          <TextInput.Icon
            icon="close"
            accessibilityLabel={t('screens.import.clearInput')}
            onPress={() => setInput('')} /> :
          undefined} />
      {/* Sits directly under the input so the hint points at what it is about */}
      <HelperText type="error" visible={tooLong}>
        {t('screens.import.tooLong')}
      </HelperText>

      <Button
        mode="contained"
        icon="import"
        loading={importing}
        disabled={!canImport}
        onPress={() => startImport(input)}>
        {importing ? t('screens.import.importing') : t('screens.import.import')}
      </Button>

      {renderResult()}
      {renderSupportedServices()}
      {renderScanSection()}
      {Platform.OS !== 'web' && renderBrowserSection()}
    </>
  );

  return (
    <Surface style={styles.screen}>
      {share ?
        <SharePreview
          share={share}
          canScan={ocrImportEnabled}
          importDisabled={!online || importing}
          onImport={() => importShare(share)}
          onDismiss={dismiss} /> :
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={CentralStyles.contentContainer}>
            {renderImport()}
          </View>
        </ScrollView>}
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  explanation: {
    gap: 8,
    marginBottom: 16,
  },
  inputContent: {
    maxHeight: 240,
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
