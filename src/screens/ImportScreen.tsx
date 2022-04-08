import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Caption, Divider, HelperText, Text, TextInput, useTheme} from 'react-native-paper';
import Spacer from 'react-spacer';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {importRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';


type Props = NativeStackScreenProps<MainNavigationProps, 'ImportScreen'>;
export const ImportScreen = (props: Props) => {
  const [importURL, setImportURL] = useState<string>('');
  const [importPending, setImportPending] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const {t} = useTranslation('translation');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const sanatizeUrl = (url: string) => {
    const urlFindingRegex = /.*((http|https)\S+).*/gm;
    const matches = urlFindingRegex.exec(url);
    if (matches?.length != 3) {
      return '';
    }
    return matches[1];
  };

  const startImport = () => {
    setImportPending(true);
    setImportSuccess(false);
    const sanatizedUrl = sanatizeUrl(importURL);

    dispatch(importRecipe(sanatizedUrl)).unwrap().then(() => {
      setImportPending(false);
      setImportError('');
      setImportSuccess(true);
      setImportURL('');
    }).catch((error: AxiosError) => {
      setImportPending(false);
      if (error.response?.status === 501) {
        setImportError(t('screens.import.notSupported'));
        return;
      }
      setImportError(error.toString());
    });
  };
  return (
    <View style={CentralStyles.fullscreen}>
      <View style={CentralStyles.contentContainer}>
        <TextInput label={t('screens.import.URLToImport')} value={importURL} onChangeText={setImportURL} />
        <Spacer height={10} />
        <Button
          color={importError.length > 0 ? theme.colors.error:theme.colors.primary}
          icon={importSuccess ? 'check' : importError.length > 0 ? 'alert-circle-outline' : undefined}
          mode="contained"
          loading={importPending}
          onPress={startImport}>
          Import
        </Button>
        <Spacer height={80} />
        <View style={{flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>

          {importError.length > 0 &&
                        <>
                          <HelperText type='error' >{t('screens.import.importFailed')} {importError}</HelperText>
                        </>
          }

          {importSuccess &&
                        <>
                          <Text style={{color: theme.colors.success}}>{t('screens.import.importSuccess')}</Text>
                        </>
          }
        </View>
        <Spacer height={40} />
        <Caption style={{textAlign: 'center'}}>{t('common.or')}</Caption>
        <Spacer height={80} />
        <Button onPress={() => props.navigation.navigate('RecipeImportBrowser')}>{t('screens.import.startRecipeBrowser')}</Button>
      </View>
    </View>

  );
};
