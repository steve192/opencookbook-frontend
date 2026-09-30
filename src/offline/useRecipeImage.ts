import {useEffect, useState} from 'react';
import {wasUnreachable} from '../api/ApiError';
import {useImageAccess} from '../components/ImageAccessContext';
import {selectLoggedIn} from '../redux/features/authSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {wentOffline} from './connectivitySlice';
import {cachedImage, downloadToCache} from './imageCache';
import {ImageSize} from './imageRequest';
import {useIsOnline} from './useIsOnline';

/**
 * An image to show: from the device when it is there, otherwise downloaded and kept.
 *
 * @param {string} [uuid] the image, absent while a recipe has none
 * @param {ImageSize} size the small copy or the whole picture
 * @return {string | undefined} a uri to render, undefined while there is none
 */
export const useRecipeImage = (uuid: string | undefined, size: ImageSize): string | undefined => {
  // Set when the image belongs to a recipe somebody shared; the viewer may have no account.
  const viaShare = useImageAccess();
  const online = useIsOnline();
  const loggedIn = useAppSelector(selectLoggedIn);
  // A shared image is read without an account; any other only while signed in.
  const downloadable = online && (viaShare !== undefined || loggedIn);
  const dispatch = useAppDispatch();
  // Kept by what it shows, so going on- or offline does not blank an image that is there.
  const key = uuid && `${size}/${uuid}`;
  const [shown, setShown] = useState<{key: string, uri: string}>();

  useEffect(() => {
    if (!uuid || !key) {
      return;
    }
    let current = true;
    const request = {uuid, size, viaShare};
    (async () => {
      const found = await cachedImage(request) ?? (downloadable ? await downloadToCache(request) : undefined);
      if (current && found) {
        setShown({key, uri: found});
      }
    })().catch((error) => {
      if (wasUnreachable(error)) {
        dispatch(wentOffline('unreachable'));
      }
    });
    return () => {
      current = false;
    };
  }, [key, viaShare, downloadable]);

  return shown && shown.key === key ? shown.uri : undefined;
};
