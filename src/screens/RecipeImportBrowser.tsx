import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, View} from 'react-native';
import {ActivityIndicator, Caption, Divider, Surface, Text, TouchableRipple} from 'react-native-paper';
import WebView from 'react-native-webview';
import RestAPI from '../dao/RestAPI';
import {importRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


export const RecipeImportBrowser = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);

  const [importPossible, setImportPossible] = useState(false);
  const [availableImportHosts, setAvailableImportHosts] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<'not_started'|'pending'|'failed'|'success'>('not_started');
  const [currentURL, setCurrentURL] = useState('');

  useEffect(() => {
    RestAPI.getAvailableImportHosts().then((list) => {
      setAvailableImportHosts(list);
    });
  }, []);

  useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          webViewRef.current?.goBack();
          return true;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () =>
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, []),
  );

  const analyseIfSiteIsImportable = (url: string) => {
    setCurrentURL(url);
    setImportPossible(availableImportHosts.some((host) => url.includes(host)));
    if (importStatus === 'pending') {
      return;
    }
    setImportStatus('not_started');
  };

  const startImport = () => {
    if (importStatus === 'pending') {
      return;
    }
    setImportStatus('pending');
    dispatch(importRecipe(currentURL)).unwrap().then(() => {
      setImportStatus('success');
    }).catch(() => {
      setImportStatus('failed');
    });
  };

  const renderImportButtonContent = () => {
    switch (importStatus) {
      case 'not_started':
        return <>
          <Text
            style={{textAlign: 'center'}}
          >{importPossible ? t('screens.importbrowser.importsecure') : t('screens.importbrowser.importinsecure')}</Text>
          <Caption
            style={{textAlign: 'center'}}
          >{importPossible ? t('screens.importbrowser.importsecuredescription') : t('screens.importbrowser.importinsecuredescription')}</Caption>
        </>;
      case 'failed':
        return <>
          <Text
            style={{textAlign: 'center'}}
          >{t('screens.importbrowser.failed')}</Text>
          <Caption
            style={{textAlign: 'center'}}
          >{ t('screens.importbrowser.faileddescription')}</Caption>
        </>;
      case 'pending':
        return <>
          <Text
            style={{textAlign: 'center'}}
          >{t('screens.importbrowser.pending')}</Text>
          <ActivityIndicator/>
        </>;
      case 'success':
        return <>
          <Text
            style={{textAlign: 'center'}}
          >{t('screens.importbrowser.success')}</Text>
        </>;
    }
  };


  // eslint-disable-next-line no-unused-vars
  const buttonColors: {[key in typeof importStatus]: string} = {
    'not_started': importPossible ? theme.colors.primary : theme.colors.accent,
    'failed': theme.colors.error,
    'pending': theme.colors.primary,
    'success': theme.colors.primary,
  };

  return (
    <Surface style={CentralStyles.fullscreen}>
      <WebView
        ref={webViewRef}
        allowsBackForwardNavigationGestures
        onNavigationStateChange={(state) => analyseIfSiteIsImportable(state.url)}
        source={{uri: 'https://google.com'}}>

      </WebView>
      <Divider/>
      <TouchableRipple
        onPress={() => startImport()}
        style={{height: 70, margin: 10, backgroundColor: buttonColors[importStatus]}}>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1}}>
          {renderImportButtonContent()}
        </View>
      </TouchableRipple>
    </Surface>

  );
};
