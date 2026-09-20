import {useEffect, useRef} from 'react';

/**
 * Wiring for an overlay that is mounted once at the root and shown from anywhere.
 * `show` before the app has mounted it does nothing.
 *
 * @return {object} `show`, for the callers, and `useOpener`, for the mounted overlay
 */
export const createGlobalOverlay = <T>() => {
  let open: ((payload: T) => void) | undefined;

  return {
    show: (payload: T) => open?.(payload),

    /**
     * @param {Function} opener what `show` does while the overlay is mounted, read
     *   fresh on every call so it may close over current state
     * @return {void}
     */
    useOpener: (opener: (payload: T) => void) => {
      const latest = useRef(opener);
      latest.current = opener;

      useEffect(() => {
        const registered = (payload: T) => latest.current(payload);
        open = registered;
        return () => {
          // A replacement that mounted before this one unmounted keeps its opener.
          if (open === registered) {
            open = undefined;
          }
        };
      }, []);
    },
  };
};
