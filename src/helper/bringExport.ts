import axios from 'axios';
import {Linking, Platform} from 'react-native';
import {apiUrl} from '../api/client';
import {BRING_DEEPLINK_API, unwrapBringDeeplink} from './bringDeeplink';

/**
 * Opens Bring on an export the server holds for a few minutes.
 *
 * @param {string} exportId the export Bring fetches its lines by
 */
export const openBringImport = async (exportId: string): Promise<void> => {
  const exportUrl = await apiUrl('/bringexport?exportId=' + exportId);

  if (Platform.OS === 'web') {
    // Plain browser redirect, no app involved, so the attribution hop does no harm here
    await Linking.openURL(BRING_DEEPLINK_API + '?source=web&url=' + encodeURIComponent(exportUrl));
    return;
  }

  const bringResponse = await axios.post<{deeplink: string}>(BRING_DEEPLINK_API, {url: exportUrl});
  const shortLink = bringResponse.data.deeplink;
  await Linking.openURL(await unwrapBringDeeplink(shortLink) ?? shortLink);
};
