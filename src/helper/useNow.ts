import {useEffect, useState} from 'react';

/**
 * The current time, renewed while mounted, for what changes with the clock rather than with data.
 *
 * @param {number} everyMillis how often
 * @return {Date} now
 */
export const useNow = (everyMillis: number): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), everyMillis);
    return () => clearInterval(tick);
  }, [everyMillis]);
  return now;
};
