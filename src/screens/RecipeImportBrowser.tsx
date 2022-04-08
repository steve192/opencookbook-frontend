import {useFocusEffect} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Caption, Divider, HelperText, Surface, Text, TextInput, useTheme} from 'react-native-paper';
import WebView from 'react-native-webview';
import Spacer from 'react-spacer';
import RestAPI from '../dao/RestAPI';
import {importRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';


export const RecipeImportBrowser = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);

  const [importPossible, setImportPossible] = useState(false);
  const [availableImportHosts, setAvailableImportHosts] = useState<string[]>([]);
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
    setImportPossible(availableImportHosts.some((host) => url.includes(host)));
  };
  const startImport = () => {
  };
  return (
    <Surface style={CentralStyles.fullscreen}>
      <WebView
        ref={webViewRef}
        allowsBackForwardNavigationGestures
        onNavigationStateChange={(state) => analyseIfSiteIsImportable(state.url)}
        source={{uri: 'https://google.com'}}>

      </WebView>
      <Button
        color={importPossible ? theme.colors.primary : theme.colors.error}
        disabled={!importPossible}
        contentStyle={{marginVertical: 20}}
        theme={{roundness: 0}}
        mode="contained"
      >{t('screens.importbrowser.import')}</Button>
    </Surface>

  );
};
