import {Button, Divider, Input, Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
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

  const theme = useTheme();
  const {t} = useTranslation('translation');

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
    RestAPI.importRecipe(sanatizedUrl).then((importedRecipe) => {
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
    <Layout style={CentralStyles.fullscreen}>
      <View style={CentralStyles.contentContainer}>
        <Text>URL to import</Text>
        <Input value={importURL} onChangeText={setImportURL} />
        <Spacer height={10} />
        <Button onPress={startImport}>Import</Button>
        <Spacer height={80} />
        <View style={{flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
          {importPending &&
                        <Spinner size="giant" />
          }

          {importError.length > 0 &&
                        <>
                          <WarningIcon width={16} height={16} fill={theme['text-danger-color']} />
                          <Text status="danger">{t('screens.import.importFailed')} {importError}</Text>
                        </>
          }

          {importSuccess &&
                        <>
                          <CheckmarkIcon width={16} height={16} fill={theme['text-success-color']} />
                          <Text status="success">{t('screens.import.importSuccess')}</Text>
                        </>
          }
        </View>
        <Spacer height={20} />
        <Divider />
        <Spacer height={20} />
        <Text category="label">{t('screens.import.supportedServices')}</Text>
        <Spacer height={10} />
        <ScrollView>
          <Text>Chefkoch</Text>
          <Text>HelloFresh</Text>
        </ScrollView>
      </View>
    </Layout>

  );
};
