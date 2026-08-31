import {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';

/**
 * How many items of a long list to render right now.
 *
 * A recipe with fifteen ingredients and ten steps mounts more than fifty text inputs, which
 * blocks the thread long enough to be felt as the screen opening frozen. This renders enough
 * to fill the screen straight away and the rest once the navigation animation has finished,
 * so the form is usable immediately and fills in behind you.
 *
 * It replaces a blanket spinner over the whole screen: the same work is done, but it no
 * longer happens between tapping edit and seeing anything at all. Once the list has been
 * fully rendered it stays that way, so an item added later appears at once.
 *
 * @param {number} total how many items the list holds
 * @param {number} initialCount how many to render before the screen has settled
 * @return {number} how many items to render now
 */
export const useProgressiveRender = (total: number, initialCount: number): number => {
  const [renderEverything, setRenderEverything] = useState(total <= initialCount);

  useEffect(() => {
    if (renderEverything) {
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => setRenderEverything(true));
    return () => task.cancel();
  }, [renderEverything]);

  return renderEverything ? total : Math.min(initialCount, total);
};
