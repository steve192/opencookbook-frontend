import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {elapsedTimerKeys} from '../helper/cookingTimers';
import {clearOrphanedRunningNotifications, clearRunningTimerNotification} from '../helper/timerNotifications';
import {VibrationUtils} from '../helper/VibrationUtil';
import {timerStopped} from '../redux/features/timersSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';

/** One second is precise enough for a cooking timer and cheap enough to run app wide. */
const TICK_MS = 1000;

/**
 * Watches the running cooking timers and announces the ones that are up.
 *
 * Mounted at the root rather than on the cooking screen, because a timer that only goes off
 * while you happen to be looking at the step that started it is no use: the reason to set
 * one is to put the phone down.
 *
 * @return {null} it renders nothing of its own, it only announces
 */
export const CookingTimerWatcher = () => {
  const timers = useAppSelector((state) => state.timers.timers);
  const dispatch = useAppDispatch();
  const {t} = useTranslation('translation');

  // Timers live in memory only, so an app that was killed comes back knowing about none of
  // them. Anything still in the shade from before is stale and is taken down on start.
  useEffect(() => {
    // On mount only: from here on, each timer takes its own reminder down
    clearOrphanedRunningNotifications(Object.keys(timers));
  }, []);

  useEffect(() => {
    if (Object.keys(timers).length === 0) {
      return;
    }
    const tick = setInterval(() => {
      elapsedTimerKeys(timers, Date.now()).forEach((key) => {
        const timer = timers[key];
        // The alert has fired by now; the reminder that it was running has served its purpose
        clearRunningTimerNotification(key);
        VibrationUtils.longPressFeedbackVibration();
        SnackbarUtil.show({
          message: t('screens.guidedCooking.timerDoneFor', {
            label: timer.label,
            recipe: timer.recipeTitle,
            step: timer.stepIndex + 1,
          }),
        });
        dispatch(timerStopped(key));
      });
    }, TICK_MS);
    return () => clearInterval(tick);
  }, [timers, dispatch, t]);

  return null;
};
