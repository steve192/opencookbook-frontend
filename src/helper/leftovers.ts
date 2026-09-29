import {useTranslation} from 'react-i18next';
import XDate from 'xdate';
import {formatShortWeekday} from './weekplan';

export const LEFTOVERS_ICON = 'food-takeout-box-outline';
export const LEFTOVERS_ICON_ACTIVE = 'food-takeout-box';

/**
 * Names the day a meal of leftovers was cooked.
 *
 * @return {Function} "Leftovers from <weekday>" for a yyyy-MM-dd day
 */
export const useLeftoversLabel = () => {
  const {t, i18n} = useTranslation('translation');
  return (cookedOn: string): string =>
    t('common.leftoversFrom', {day: formatShortWeekday(new XDate(cookedOn), i18n.language)});
};
