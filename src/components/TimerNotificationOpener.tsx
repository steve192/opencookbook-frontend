import {useCallback} from 'react';
import {TimerNotificationTarget} from '../helper/cookingTimers';
import {useTimerNotificationTap} from '../helper/timerNotifications';
import {navigationRef} from '../navigation/navigationRef';

/**
 * Opens the step a timer belongs to when its notification is tapped.
 *
 * A timer notification says which recipe and step it came from, and that is exactly where
 * the user wants to be: back at the pot.
 *
 * @return {null} it renders nothing, it only reacts
 */
export const TimerNotificationOpener = () => {
  const openStep = useCallback((target: TimerNotificationTarget) => {
    if (!navigationRef.isReady()) {
      return;
    }
    // What the servings were scaled to is not worth carrying through a notification, so cooking
    // opens at what the recipe itself says.
    navigationRef.navigate('default', {
      screen: 'GuidedCookingScreen',
      params: {recipeId: target.recipeId, initialStep: target.stepIndex},
    });
  }, []);

  useTimerNotificationTap(openStep);

  return null;
};
