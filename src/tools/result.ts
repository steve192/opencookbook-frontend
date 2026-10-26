import {escapeHtml, toPrintDocument} from '../helper/htmlDocument';

/** One line of a result: what it is and how much. */
export interface ResultLine {
  label: string;
  value: string;
  /** Lines that belong to this one, such as each infusion of a tea; shown indented below it. */
  details?: ResultLine[];
  /** An explanation behind an info icon on screen. */
  info?: string;
}

/** A titled group of result lines, such as the levain of a bread. */
export interface ResultSection {
  title?: string;
  /** Shown beside the title on screen. */
  icon?: string;
  lines: ResultLine[];
  /** Instructions in order, after the lines. */
  steps?: string[];
}

/**
 * A result as plain text, for copying into a message or a note.
 *
 * @param {string} title the tool's result title
 * @param {ResultSection[]} sections what was calculated
 * @param {string} footer closes the text, such as a disclaimer
 * @return {string} one line per value, sections separated by a blank line
 */
export const resultText = (title: string, sections: ResultSection[], footer: string): string =>
  [title, ...sections.map((section) => [
    ...(section.title ? [section.title] : []),
    ...section.lines.flatMap((line) => [`${line.label}: ${line.value}`,
      ...(line.details ?? []).map((detail) => `  ${detail.label}: ${detail.value}`)]),
    ...(section.steps ?? []).map((step, index) => `${index + 1}. ${step}`),
  ].join('\n')), footer].join('\n\n');

const row = (line: ResultLine, className?: string) => {
  const classAttribute = className ? ` class="${className}"` : '';
  return `<tr${classAttribute}><td>${escapeHtml(line.label)}</td><td>${escapeHtml(line.value)}</td></tr>`;
};

const lineHtml = (line: ResultLine) => {
  const details = (line.details ?? []).map((detail) => row(detail, 'detail')).join('');
  return `<tbody>${row(line)}${details}</tbody>`;
};

const sectionHtml = (section: ResultSection) => {
  const heading = section.title ? `<h2>${escapeHtml(section.title)}</h2>` : '';
  const items = section.steps?.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  const steps = items == null ? '' : `<ol>${items}</ol>`;
  return `${heading}<table>${section.lines.map(lineHtml).join('')}</table>${steps}`;
};

/**
 * A result as a printable document: black on white, for the kitchen wall.
 *
 * @param {string} title the tool's result title
 * @param {ResultSection[]} sections what was calculated
 * @param {string} footer closes the page in small print, such as a disclaimer
 * @return {string} a complete html document
 */
export const resultHtml = (title: string, sections: ResultSection[], footer: string): string => toPrintDocument(title, `
  h1 { font-size: 20pt; margin: 0 0 12pt; }
  h2 { font-size: 13pt; margin: 14pt 0 4pt; }
  table { border-collapse: collapse; width: 100%; }
  tbody { border-bottom: 0.5pt solid #ccc; }
  td { padding: 3pt 0; font-size: 12pt; }
  td:last-child { text-align: right; font-weight: 600; }
  tr.detail td { padding-top: 0; font-size: 10.5pt; font-weight: 400; color: #444; }
  tr.detail td:first-child { padding-left: 6mm; }
  ol { margin: 4pt 0 0; padding-left: 6mm; font-size: 12pt; }
  li { margin: 0 0 4pt; }
  .footer { margin-top: 14pt; font-size: 9pt; color: #555; }`, `<h1>${escapeHtml(title)}</h1>
${sections.map(sectionHtml).join('\n')}
<p class="footer">${escapeHtml(footer)}</p>`);
