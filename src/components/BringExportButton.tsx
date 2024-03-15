import React from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, Platform, View} from 'react-native';
import {Avatar, Button} from 'react-native-paper';
import RestAPI from '../dao/RestAPI';
import axios from 'axios';
import AppPersistence from '../AppPersistence';

type Props = {
    recipeId: number;
}

export const BringImportButton = (props: React.ComponentPropsWithRef<typeof View> & Props ) => {
  const {t} = useTranslation('translation');

  const startBringImport = async () => {
    const exportId = await RestAPI.createBringExport(props.recipeId);
    const exportUrl = (await AppPersistence.getBackendURL()) + AppPersistence.getApiRoute() + '/bringexport?exportId=' + exportId;

    if (Platform.OS === 'web') {
      Linking.openURL('https://api.getbring.com/rest/bringrecipes/deeplink?source=web&url=' + encodeURIComponent(exportUrl));
    } else {
      const bringResponse = await axios.post<{deeplink: string}>('https://api.getbring.com/rest/bringrecipes/deeplink', {
        url: exportUrl,
      });

      Linking.openURL(bringResponse.data.deeplink);
    }
  };

  return (
    <Button {...props}
      contentStyle={{height: 42}}
      style={[{width: 400, height: 42}, props.style]}
      icon={() => <Avatar.Image size={24} source={require('../../assets/Bring_Logo_big.png')}/>}
      buttonColor="#324047"
      mode="elevated"
      onPress={() => startBringImport()} >{t('common.bringimport')}</Button>
  );
};
