import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {registerServiceWorker} from './serviceWorker';

/**
 * Offers a new version of the web app as soon as it is downloaded, until the reader takes it.
 *
 * @return {null} nothing to render
 */
export const ServiceWorkerUpdates = () => {
  const {t} = useTranslation('translation');
  useEffect(() => {
    registerServiceWorker((reload) => SnackbarUtil.show({
      message: t('pwa.update.available'),
      action: t('pwa.update.reload'),
      onAction: reload,
      duration: Number.POSITIVE_INFINITY,
    })).catch((error) => console.error('Service worker registration failed', error));
  }, []);
  return null;
};
