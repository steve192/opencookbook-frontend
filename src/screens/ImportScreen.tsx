import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Divider, HelperText, TextInput, Text, useTheme, Caption} from 'react-native-paper';
import Spacer from 'react-spacer';
import {CheckmarkIcon, WarningIcon} from '../assets/Icons';
import RestAPI from '../dao/RestAPI';
import CentralStyles from '../styles/CentralStyles';

interface Props {
    importUrl?: string
}
export const ImportScreen = (props: Props) => {
  const [importURL, setImportURL] = useState<string>('');
  const [importPending, setImportPending] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const {t} = useTranslation('translation');
  const theme = useTheme();

  const startImport = () => {
    setImportPending(true);
    setImportSuccess(false);
    RestAPI.importRecipe(importURL).then((importedRecipe) => {
      setImportPending(false);
      setImportError('');
      setImportSuccess(true);
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
        <Button icon={importSuccess ? 'check' : undefined} mode="contained" loading={importPending} onPress={startImport}>
          {importSuccess ? <CheckmarkIcon fill={theme.colors.accent}/> : undefined}
          Import
        </Button>
        <Spacer height={80} />
        <View style={{flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>

          {importError.length > 0 &&
                        <>
                          <WarningIcon width={16} height={16} fill={theme.colors.error} />
                          <HelperText type='error' >{t('screens.import.importFailed')} {importError}</HelperText>
                        </>
          }

          {importSuccess &&
                        <>
                          <CheckmarkIcon width={16} height={16} fill={theme.colors.accent} />
                          <Text style={{color: theme.colors.accent}}>{t('screens.import.importSuccess')}</Text>
                        </>
          }
        </View>
        <Spacer height={20} />
        <Divider />
        <Spacer height={20} />
        <Caption>{t('screens.import.supportedServices')}</Caption>
        <Spacer height={10} />
        <ScrollView>
          <Text>Chefkoch</Text>
          <Text>HelloFresh</Text>
        </ScrollView>
      </View>
    </View>

  );
};
