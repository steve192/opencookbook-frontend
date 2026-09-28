import {useEffect, useState} from 'react';

/**
 * A switch kept on this device: read once, written on every change.
 *
 * @param {Function} read loads the stored value, undefined when never set
 * @param {Function} write stores a new value
 * @param {boolean} fallback shown until read, and when nothing is stored
 * @return {Array} the value and its setter
 */
export const usePersistedFlag = (
    read: () => Promise<boolean | undefined>,
    write: (value: boolean) => Promise<void>,
    fallback: boolean,
): [boolean, (value: boolean) => void] => {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    read().then((stored) => setValue(stored ?? fallback));
  }, []);
  const change = (next: boolean) => {
    setValue(next);
    write(next);
  };
  return [value, change];
};
