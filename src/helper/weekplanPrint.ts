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
 * Recipe titles are user content and end up inside markup here.
 *
 * @param {string} value text to put into the document
 * @return {string} the text with the markup characters escaped
 */
const escapeHtml = (value: string): string =>
  value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

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
  return `<ul>${day.meals.map((meal) => `<li>${escapeHtml(meal)}</li>`).join('')}</ul>`;
};

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
export const buildWeekplanPrintHtml = (weekplan: PrintableWeekplan): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(weekplan.title)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #111;
    /* The frame the web build prints from has no page size of its own */
    width: 182mm;
    margin: 0 auto;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
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
  .empty { margin: 0; font-size: 10pt; color: #999; font-style: italic; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(weekplan.title)}</h1>
  <p class="subtitle">${escapeHtml(weekplan.subtitle)}</p>
</header>
${weekplan.days.map((day) => `<section class="day">
  <div class="day-header">
    <span class="weekday">${escapeHtml(day.weekday)}</span>
    <span class="date">${escapeHtml(day.date)}</span>
  </div>
  <div class="meals">${renderMeals(day, weekplan.emptyLabel)}</div>
</section>`).join('\n')}
</body>
</html>`;
