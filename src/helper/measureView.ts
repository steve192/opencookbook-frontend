import {View} from 'react-native';

/** Page coordinates, as a view drawn over everything is placed. */
export interface PageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where a view is on the page.
 *
 * @param {View} view the view, if mounted
 * @return {Promise<PageRect | undefined>} its rectangle, or nothing while it is not laid out
 */
export const measureView = (view: View | null | undefined): Promise<PageRect | undefined> =>
  new Promise((resolve) => {
    if (!view) {
      resolve(undefined);
      return;
    }
    view.measure((_x, _y, width, height, pageX, pageY) =>
      resolve(width > 0 ? {x: pageX, y: pageY, width, height} : undefined));
  });
