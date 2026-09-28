import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ProviderDialog} from '../../components/shopping/ProviderDialog';
import RestAPI, {ShoppingProvider} from '../../dao/RestAPI';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {errorMessageKey} from '../apiErrorMessage';
import {openBringImport} from '../bringExport';
import {SnackbarUtil} from '../GlobalSnackbar';
import {useOnlineGuard} from '../useOnlineGuard';
import {ShoppingImportTarget} from './importTarget';
import {useShoppingProvider} from './useShoppingProvider';

/**
 * Starts putting a week or a recipe on the shopping list. Asks where it should go the first time;
 * a single recipe goes to Bring in one tap, as it always has, everything else opens the sheet.
 *
 * @return {object} the provider, start, whether a Bring export is under way, and the dialog to render
 */
export const useShoppingImport = () => {
  const {t} = useTranslation('translation');
  const navigation = useNavigation<NativeStackNavigationProp<MainNavigationProps>>();
  const requireOnline = useOnlineGuard();
  const {provider, choose} = useShoppingProvider();
  const [asking, setAsking] = useState<ShoppingImportTarget>();
  // Without feedback during the two requests a Bring export takes, the button gets tapped again,
  // firing a second deeplink at Bring while it is still starting up.
  const [exporting, setExporting] = useState(false);

  const proceed = async (target: ShoppingImportTarget, chosen: ShoppingProvider) => {
    if (chosen === 'COOKPAL' || target.kind === 'week') {
      navigation.navigate('ShoppingImportScreen', target);
      return;
    }
    setExporting(true);
    try {
      await openBringImport(await RestAPI.createBringExport(target.recipeId));
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error, 'common.bringimportfailed'))});
    } finally {
      setExporting(false);
    }
  };

  const start = (target: ShoppingImportTarget) => {
    if (!requireOnline()) {
      return;
    }
    if (provider) {
      proceed(target, provider);
    } else {
      setAsking(target);
    }
  };

  const chooseAndProceed = async (target: ShoppingImportTarget, chosen: ShoppingProvider) => {
    try {
      await choose(chosen);
      await proceed(target, chosen);
    } catch (error) {
      SnackbarUtil.show({message: t(errorMessageKey(error))});
    }
  };

  const dialog = (
    <ProviderDialog
      visible={asking !== undefined}
      onDismiss={() => setAsking(undefined)}
      onChoose={(chosen) => asking && chooseAndProceed(asking, chosen)} />
  );

  return {provider, start, exporting, dialog};
};
