import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, StyleSheet, View} from 'react-native';
import {Button, Divider, Icon, IconButton, ProgressBar, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {useGetAvailableImportHostsQuery} from '../api/endpoints/recipes';
import {hostOf} from '../helper/sharedContent';
import {useRecipeImport} from '../helper/useRecipeImport';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {useIsOnline} from '../offline/useIsOnline';
import {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeImportBrowser'>;

type ImportStatus = 'not_started' | 'pending' | 'failed' | 'success';

/**
 * Google shows its consent wall on nearly every visit from a web view, which is the first
 * thing anyone importing a recipe had to click through. DuckDuckGo asks for no consent at
 * all, so the search page is simply a search page.
 */
const START_PAGE = 'https://duckduckgo.com/';

const NO_HOSTS: string[] = [];

export const RecipeImportBrowser = (props: Props) => {
  const {t} = useTranslation('translation');
  const online = useIsOnline();
  // Pushed, so saving the draft leads back to the page.
  const {startImport: importFrom, importing, result, clearResult} = useRecipeImport({
    openDraft: () => props.navigation.navigate('RecipeWizardScreen', {hasDraft: true}),
    failureFallback: 'screens.importbrowser.faileddescription',
  });
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const availableImportHosts = useGetAvailableImportHostsQuery().data ?? NO_HOSTS;
  const [currentURL, setCurrentURL] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loadProgress, setLoadProgress] = useState(1);

  useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          webViewRef.current?.goBack();
          return true;
        };

        const handler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () =>
          handler.remove();
      }, []),
  );

  // Derived rather than stored, so a host list that only arrives after the first
  // navigation still upgrades the hint for the page the user is already looking at.
  const importPossible = useMemo(
      () => availableImportHosts.some((host) => currentURL.includes(host)),
      [availableImportHosts, currentURL],
  );

  const onNavigationStateChange = (state: {url: string, canGoBack: boolean, canGoForward: boolean}) => {
    setCurrentURL(state.url);
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    if (importing) {
      return;
    }
    // Leaving the page the result belongs to invalidates that result
    clearResult();
  };

  /**
   * Sends the browser back to the search page.
   *
   * Done from inside the page rather than by changing the source: the ref exposes no way to
   * load a url, and setting the source back to a value it already holds is not a change, so
   * nothing would happen.
   */
  const goToSearch = () => {
    webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(START_PAGE)}; true;`);
  };

  const startImport = () => {
    if (importing || !currentURL) {
      return;
    }
    importFrom(currentURL);
  };

  const openImportedRecipe = () => {
    const recipeId = result?.kind === 'saved' ? result.recipe.id : undefined;
    recipeId && props.navigation.navigate('RecipeScreen', {recipeId});
  };

  const importStatus: ImportStatus =
    importing ? 'pending' :
    result?.kind === 'saved' ? 'success' :
    result?.kind === 'failed' ? 'failed' : 'not_started';

  // Icon, wording, colour and button label all follow the same status, so keep them together
  // eslint-disable-next-line no-unused-vars
  const statusPresentation: {[key in ImportStatus]: {
    icon: string, title?: string, detail: string, label: string, color: string
  }} = {
    'not_started': importPossible ? {
      icon: 'check-decagram-outline',
      detail: t('screens.importbrowser.importsecuredescription'),
      label: t('screens.importbrowser.importsecure'),
      color: theme.colors.onSurfaceVariant,
    } : {
      icon: 'help-circle-outline',
      detail: t('screens.importbrowser.importinsecuredescription'),
      label: t('screens.importbrowser.importinsecure'),
      color: theme.colors.onSurfaceVariant,
    },
    'pending': {
      icon: 'progress-download',
      detail: t('screens.importbrowser.pending'),
      label: t('screens.importbrowser.pending'),
      color: theme.colors.onSurfaceVariant,
    },
    'failed': {
      icon: 'alert-circle-outline',
      title: t('screens.importbrowser.failed'),
      detail: t(result?.kind === 'failed' ? result.messageKey : 'screens.importbrowser.faileddescription'),
      label: t('screens.importbrowser.retry'),
      color: theme.colors.error,
    },
    'success': {
      icon: 'check-circle-outline',
      title: t('screens.importbrowser.success'),
      detail: t('screens.importbrowser.successdescription'),
      label: t('screens.importbrowser.openRecipe'),
      color: theme.colors.primaryText,
    },
  };
  const presentation = statusPresentation[importStatus];

  return (
    <Surface style={styles.screen}>
      {/* Browser chrome: hardware back only exists on Android, and nothing else told
          the user which page an import would actually grab. */}
      <View style={styles.addressBar}>
        <IconButton
          icon="arrow-left"
          size={20}
          disabled={!canGoBack}
          accessibilityLabel={t('screens.importbrowser.back')}
          onPress={() => webViewRef.current?.goBack()} />
        <IconButton
          icon="arrow-right"
          size={20}
          disabled={!canGoForward}
          accessibilityLabel={t('screens.importbrowser.forward')}
          onPress={() => webViewRef.current?.goForward()} />
        <Text numberOfLines={1} style={styles.addressText}>
          {currentURL ? hostOf(currentURL) : t('screens.importbrowser.hint')}
        </Text>
        <IconButton
          icon="refresh"
          size={20}
          accessibilityLabel={t('screens.importbrowser.reload')}
          onPress={() => webViewRef.current?.reload()} />
        {/* A way back to the search once you have followed a recipe several sites deep */}
        <IconButton
          icon="magnify"
          size={20}
          accessibilityLabel={t('screens.importbrowser.home')}
          onPress={goToSearch} />
      </View>
      <ProgressBar
        progress={loadProgress}
        visible={loadProgress < 1}
        style={styles.progressBar} />

      <WebView
        ref={webViewRef}
        style={styles.webView}
        allowsBackForwardNavigationGestures
        onLoadProgress={(event) => setLoadProgress(event.nativeEvent.progress)}
        onLoadEnd={() => setLoadProgress(1)}
        onNavigationStateChange={onNavigationStateChange}
        source={{uri: START_PAGE}}>

      </WebView>

      <Divider/>
      {/* Android draws edge to edge since the Expo 57 upgrade, so without the bottom
          inset this whole bar sits behind the system navigation bar. */}
      <View style={[styles.actionBar, {paddingBottom: insets.bottom + 12}]}>
        <View style={styles.statusRow}>
          <Icon source={presentation.icon} size={18} color={presentation.color} />
          <View style={styles.statusTexts}>
            {presentation.title &&
              <Text style={{color: presentation.color, fontWeight: 'bold'}}>{presentation.title}</Text>
            }
            <Text numberOfLines={2} style={{color: presentation.color}}>{presentation.detail}</Text>
          </View>
        </View>
        <Button
          mode={importStatus === 'not_started' && !importPossible ? 'contained-tonal' : 'contained'}
          buttonColor={importStatus === 'failed' ? theme.colors.destructive : undefined}
          textColor={importStatus === 'failed' ? theme.colors.onDestructive : undefined}
          icon={importStatus === 'success' ? 'arrow-right' : 'import'}
          loading={importStatus === 'pending'}
          disabled={!online || importStatus === 'pending' || !currentURL}
          onPress={importStatus === 'success' ? openImportedRecipe : startImport}>
          {presentation.label}
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  addressText: {
    flex: 1,
    marginHorizontal: 4,
  },
  progressBar: {
    height: 2,
  },
  actionBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTexts: {
    flex: 1,
  },
});
