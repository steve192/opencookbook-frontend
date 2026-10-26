import {useTranslation} from 'react-i18next';
import XDate from 'xdate';
import {ShoppingListEvent} from '../../api/types/shopping';
import {formatShortWeekday, formatWeekdayAndDate, toDayKey} from '../weekplan';

/** The events of one day, newest first. */
export interface HistoryDay {
  day: string;
  data: ShoppingListEvent[];
}

/**
 * Events under the day they happened on, on this device's calendar.
 *
 * @param {ShoppingListEvent[]} events newest first
 * @return {HistoryDay[]} the days, newest first
 */
export const historyDays = (events: ShoppingListEvent[]): HistoryDay[] =>
  events.reduce<HistoryDay[]>((days, event) => {
    const day = toDayKey(new XDate(event.at));
    const current = days.at(-1);
    if (current?.day === day) {
      current.data.push(event);
    } else {
      days.push({day, data: [event]});
    }
    return days;
  }, []);

/**
 * How the history reads: a day's heading, an event's title, and who did what when.
 *
 * @return {object} the three texts
 */
export const useHistoryTexts = () => {
  const {t, i18n} = useTranslation('translation');
  const language = i18n.language;

  const dayTitle = (day: string): string => {
    const today = new XDate().clearTime();
    if (day === toDayKey(today)) return t('screens.shopping.history.today');
    if (day === toDayKey(today.clone().addDays(-1))) return t('screens.shopping.history.yesterday');
    return formatWeekdayAndDate(new XDate(day), language);
  };

  const title = (event: ShoppingListEvent): string =>
    event.kind === 'ADDED' && event.spec ? `${event.name} · ${event.spec}` : event.name;

  const change = (event: ShoppingListEvent): string => {
    const options = {
      who: event.actor ?? t('screens.shopping.history.formerMember'),
      previous: event.previousName,
      spec: event.spec,
      aisle: t(`aisles.${event.aisle}`),
    };
    const kind = event.kind === 'SPEC_CHANGED' && !event.spec ? 'SPEC_CLEARED' : event.kind;
    const said = t(`screens.shopping.history.kinds.${kind}.${event.byViewer ? 'you' : 'other'}`, options);
    if (event.kind !== 'ADDED' || event.sources.length === 0) {
      return said;
    }
    const meals = event.sources.map((source) => source.planDate ?
      `${source.title} (${formatShortWeekday(new XDate(source.planDate), language)})` : source.title).join(', ');
    return `${said} ${t('screens.shopping.history.forMeals', {meals})}`;
  };

  const doneBy = (event: ShoppingListEvent): string =>
    `${change(event)} · ${new Date(event.at).toLocaleTimeString(language, {hour: '2-digit', minute: '2-digit'})}`;

  return {dayTitle, title, doneBy};
};
