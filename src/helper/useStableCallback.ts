import {useCallback, useLayoutEffect, useRef} from 'react';

/**
 * A callback that keeps its identity across renders but always runs the latest function, so passing it
 * does not re-render a memoised child.
 *
 * @param {Function} callback the function to run
 * @return {Function} the stable callback
 */
export const useStableCallback = <A extends unknown[], R>(callback: (...args: A) => R): (...args: A) => R => {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback;
  });
  return useCallback((...args: A) => latest.current(...args), []);
};
