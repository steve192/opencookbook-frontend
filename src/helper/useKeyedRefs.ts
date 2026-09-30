import {useCallback, useRef} from 'react';

type KeyedRef<T> = (value: T | null) => void;

/**
 * Mounted values by key, e.g. the views of tiles.
 *
 * @return {object} register, whose result goes to a ref, and the values mounted now
 */
export const useKeyedRefs = <T>() => {
  const values = useRef(new Map<string, T>());
  // One ref per key, so a re-render does not detach and attach every value.
  const refs = useRef(new Map<string, KeyedRef<T>>());

  const register = useCallback((key: string): KeyedRef<T> => {
    let ref = refs.current.get(key);
    if (!ref) {
      ref = (value) => {
        if (value) {
          values.current.set(key, value);
        } else {
          values.current.delete(key);
        }
      };
      refs.current.set(key, ref);
    }
    return ref;
  }, []);

  return {register, values: values.current};
};
