import {useTranslation} from 'react-i18next';
import XDate from 'xdate';

/**
 * Calendar days from a moment to now, on this device's calendar.
 *
 * @param {string} instant an ISO instant
 * @param {Date} now the present
 * @return {number} 0 for today, 1 for yesterday
 */
export const daysSince = (instant: string, now: Date): number =>
  Math.max(0, Math.round(new XDate(instant).clearTime().diffDays(new XDate(now).clearTime())));

/**
 * How a regular item's rhythm and last purchase read.
 *
 * @return {object} the two texts, each for its value
 */
export const useRhythmTexts = () => {
  const {t} = useTranslation('translation');
  const lastBought = (instant: string): string => {
    const days = daysSince(instant, new Date());
    if (days === 0) return t('screens.shopping.regulars.lastBoughtToday');
    if (days === 1) return t('screens.shopping.regulars.lastBoughtYesterday');
    return t('screens.shopping.regulars.lastBoughtDaysAgo', {count: days});
  };
  return {every: (days: number) => t('screens.shopping.regulars.every', {count: days}), lastBought};
};
