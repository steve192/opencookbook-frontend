import {escapeHtml, toPrintDocument} from './htmlDocument';

/** One day as it appears on the printed sheet. */
export interface PrintableWeekplanDay {
  weekday: string;
  date: string;
  meals: string[];
}

export interface PrintableWeekplan {
  title: string;
  subtitle: string;
  days: PrintableWeekplanDay[];
  /** Shown in place of the meals of a day that has none */
  emptyLabel: string;
}

/**
 * Renders the meals of one day, or the empty notice.
 *
 * @param {PrintableWeekplanDay} day the day to render
 * @param {string} emptyLabel notice for a day without meals
 * @return {string} the markup of that day's meals
 */
const renderMeals = (day: PrintableWeekplanDay, emptyLabel: string): string => {
  if (day.meals.length === 0) {
    return `<p class="empty">${escapeHtml(emptyLabel)}</p>`;
  }
  const items = day.meals.map((meal) => `<li>${escapeHtml(meal)}</li>`).join('');
  return `<ul>${items}</ul>`;
};

/**
 * Renders one day with its meals.
 *
 * @param {PrintableWeekplanDay} day the day to render
 * @param {string} emptyLabel notice for a day without meals
 * @return {string} the markup of that day
 */
const renderDay = (day: PrintableWeekplanDay, emptyLabel: string): string => `<section class="day">
  <div class="day-header">
    <span class="weekday">${escapeHtml(day.weekday)}</span>
    <span class="date">${escapeHtml(day.date)}</span>
  </div>
  <div class="meals">${renderMeals(day, emptyLabel)}</div>
</section>`;

/**
 * Builds a self contained A4 sheet for one week.
 *
 * Kept free of any print API so the document can be asserted on directly, and
 * used unchanged on every platform so a printed week looks the same everywhere.
 * The layout is black on white with no images: it has to survive a home printer
 * and stay readable pinned to a fridge.
 *
 * @param {PrintableWeekplan} weekplan what to put on the sheet
 * @return {string} a complete html document
 */
export const buildWeekplanPrintHtml = (weekplan: PrintableWeekplan): string => toPrintDocument(weekplan.title, `
  header { border-bottom: 1.5pt solid #111; padding-bottom: 3mm; margin-bottom: 6mm; }
  h1 { font-size: 20pt; line-height: 1.1; margin: 0; }
  .subtitle { font-size: 10.5pt; color: #555; margin: 1.5mm 0 0 0; }
  .day {
    border: 0.75pt solid #bbb;
    border-radius: 2mm;
    margin-bottom: 3mm;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    background: #f0f0f0;
    border-bottom: 0.75pt solid #bbb;
    padding: 1.8mm 3mm;
  }
  .weekday { font-size: 11.5pt; font-weight: bold; letter-spacing: 0.3pt; }
  .date { font-size: 9.5pt; color: #555; }
  /* Sized so the seven days spread over the page instead of bunching at the
     top, and so a day without meals leaves room to write one in by hand. */
  .meals { padding: 2.5mm 3mm; min-height: 22mm; }
  ul { margin: 0; padding-left: 5mm; }
  li { font-size: 11pt; line-height: 1.55; }
  .empty { margin: 0; font-size: 10pt; color: #999; font-style: italic; }`, `<header>
  <h1>${escapeHtml(weekplan.title)}</h1>
  <p class="subtitle">${escapeHtml(weekplan.subtitle)}</p>
</header>
${weekplan.days.map((day) => renderDay(day, weekplan.emptyLabel)).join('\n')}`);
