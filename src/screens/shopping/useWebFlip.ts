import {useLayoutEffect, useRef} from 'react';
import {Platform, View} from 'react-native';
import {useKeyedRefs} from '../../helper/useKeyedRefs';

type CellRef = (view: View | null) => void;

const TRANSITION = 'transform 250ms ease-in-out';

/**
 * Slides moved cells to their new place on the web. Reanimated's layout animations measure each view between
 * writes, laying the page out once per tile; here all positions are read in one go after a render (FLIP).
 *
 * @param {boolean} enabled whether to animate at all; on native, reanimated's layout animations do it
 * @param {Set} still keys of cells to place at once, e.g. while a copy flies there
 * @return {Function} register, whose result goes to the ref of a cell's content
 */
export const useWebFlip = (enabled: boolean, still: ReadonlySet<string>): (key: string) => CellRef => {
  const active = enabled && Platform.OS === 'web';
  const {register, values: views} = useKeyedRefs<View>();
  const positions = useRef(new Map<string, {x: number, y: number}>());

  useLayoutEffect(() => {
    if (!active) {
      return;
    }
    // On the web, a view is its DOM element.
    const elements = new Map([...views].map(([key, view]) => [key, view as unknown as HTMLElement]));
    // The cell's own offset in the grid: unaffected by transforms and by scrolling.
    const next = new Map<string, {x: number, y: number}>();
    elements.forEach((element, key) => {
      const cell = element.parentElement;
      if (cell) {
        next.set(key, {x: cell.offsetLeft, y: cell.offsetTop});
      }
    });
    const moved = [...next.entries()].flatMap(([key, position]) => {
      const before = positions.current.get(key);
      const element = elements.get(key);
      return before && element && !still.has(key) && (before.x !== position.x || before.y !== position.y) ?
        [{element, dx: before.x - position.x, dy: before.y - position.y}] : [];
    });
    positions.current = next;
    if (moved.length === 0) {
      return;
    }
    moved.forEach(({element, dx, dy}) => {
      element.style.transition = 'none';
      element.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    // One layout for all of them, so the transition starts from the old place.
    void moved[0].element.offsetWidth;
    moved.forEach(({element}) => {
      element.style.transition = TRANSITION;
      element.style.transform = '';
    });
  });

  return register;
};
