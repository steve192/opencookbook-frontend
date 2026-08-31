import {useTranslation} from 'react-i18next';
import {useAppSelector} from '../redux/hooks';
import {PromptUtil} from './Prompt';

/**
 * Guards an action that needs the server.
 *
 * Every screen that writes something used to repeat the same online check and
 * the same prompt; this keeps the wording and the behaviour in one place.
 *
 * @return {Function} a check returning whether the action may go ahead, which
 *   tells the user why it may not when it returns false
 */
export const useOnlineGuard = (): (() => boolean) => {
  const isOnline = useAppSelector((state) => state.settings.isOnline);
  const {t} = useTranslation('translation');

  return () => {
    if (isOnline) {
      return true;
    }
    PromptUtil.show({
      title: t('common.offline.notavailabletitle'),
      button1: t('common.ok'),
      message: t('common.offline.notavailable'),
    });
    return false;
  };
};
