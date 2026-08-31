import {useCallback} from 'react';
import {TimerNotificationTarget} from '../helper/cookingTimers';
import {useTimerNotificationTap} from '../helper/timerNotifications';
import {navigationRef} from '../navigation/navigationRef';
import {fetchSingleRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';

/**
 * Opens the step a timer belongs to when its notification is tapped.
 *
 * A timer notification says which recipe and step it came from, and that is exactly where
 * the user wants to be: back at the pot. The recipe is fetched first because the tap may
 * have started the app, in which case nothing has been loaded yet.
 *
 * @return {null} it renders nothing, it only reacts
 */
export const TimerNotificationOpener = () => {
  const dispatch = useAppDispatch();

  const openStep = useCallback(async (target: TimerNotificationTarget) => {
    if (!navigationRef.isReady()) {
      return;
    }
    try {
      const recipe = await dispatch(fetchSingleRecipe(target.recipeId)).unwrap();
      navigationRef.navigate('default', {
        screen: 'GuidedCookingScreen',
        params: {
          recipe,
          // What the servings were scaled to is not worth carrying through a notification,
          // so cooking opens at what the recipe itself says.
          scaledServings: recipe.servings,
          initialStep: target.stepIndex,
        },
      });
    } catch {
      // The recipe is gone, or nobody is signed in - either way there is nowhere to go
    }
  }, [dispatch]);

  useTimerNotificationTap(openStep);

  return null;
};
