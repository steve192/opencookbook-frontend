import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, Platform, View} from 'react-native';
import {Avatar, Button} from 'react-native-paper';
import RestAPI from '../dao/RestAPI';
import axios from 'axios';
import AppPersistence from '../AppPersistence';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {BRING_DEEPLINK_API, unwrapBringDeeplink} from '../helper/bringDeeplink';

type Props = {
    recipeId: number;
}

export const BringImportButton = (props: React.ComponentPropsWithRef<typeof View> & Props ) => {
  const {t} = useTranslation('translation');
  // Creating the export and asking bring for a deeplink are separate requests. Without feedback
  // the button looks dead in the meantime and gets tapped again, which fires a second deeplink
  // at bring while it is still starting up from the first one
  const [exporting, setExporting] = useState(false);

  const startBringImport = async () => {
    setExporting(true);
    try {
      const exportId = await RestAPI.createBringExport(props.recipeId);
      const exportUrl = (await AppPersistence.getBackendURL()) + AppPersistence.getApiRoute() + '/bringexport?exportId=' + exportId;

      if (Platform.OS === 'web') {
        // Plain browser redirect, no app involved, so the attribution hop does no harm here
        await Linking.openURL(BRING_DEEPLINK_API + '?source=web&url=' + encodeURIComponent(exportUrl));
        return;
      }

      const bringResponse = await axios.post<{deeplink: string}>(BRING_DEEPLINK_API, {
        url: exportUrl,
      });
      const shortLink = bringResponse.data.deeplink;

      await Linking.openURL(await unwrapBringDeeplink(shortLink) ?? shortLink);
    } catch (error) {
      SnackbarUtil.show({message: t('common.bringimportfailed')});
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button {...props}
      contentStyle={{height: 42}}
      style={[{width: 400, height: 42}, props.style]}
      icon={() => <Avatar.Image size={24} source={require('../../assets/Bring_Logo_big.png')}/>}
      buttonColor="#324047"
      mode="elevated"
      loading={exporting}
      disabled={exporting}
      onPress={() => startBringImport()} >{t('common.bringimport')}</Button>
  );
};
