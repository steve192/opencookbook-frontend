import {escapeHtml, toPrintDocument} from '../helper/htmlDocument';

/** One line of a result: what it is and how much. */
export interface ResultLine {
  label: string;
  value: string;
}

/** A titled group of result lines, such as the levain of a bread. */
export interface ResultSection {
  title?: string;
  /** Shown beside the title on screen. */
  icon?: string;
  lines: ResultLine[];
}

/**
 * A result as plain text, for copying into a message or a note.
 *
 * @param {string} title the tool's result title
 * @param {ResultSection[]} sections what was calculated
 * @return {string} one line per value, sections separated by a blank line
 */
export const resultText = (title: string, sections: ResultSection[]): string =>
  [title, ...sections.map((section) => [
    ...(section.title ? [section.title] : []),
    ...section.lines.map((line) => `${line.label}: ${line.value}`),
  ].join('\n'))].join('\n\n');

/**
 * A result as a printable document: black on white, for the kitchen wall.
 *
 * @param {string} title the tool's result title
 * @param {ResultSection[]} sections what was calculated
 * @return {string} a complete html document
 */
export const resultHtml = (title: string, sections: ResultSection[]): string => toPrintDocument(title, `
  h1 { font-size: 20pt; margin: 0 0 12pt; }
  h2 { font-size: 13pt; margin: 14pt 0 4pt; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 3pt 0; border-bottom: 0.5pt solid #ccc; font-size: 12pt; }
  td:last-child { text-align: right; font-weight: 600; }`, `<h1>${escapeHtml(title)}</h1>
${sections.map((section) => `${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ''}<table>${
    section.lines.map((line) => `<tr><td>${escapeHtml(line.label)}</td><td>${escapeHtml(line.value)}</td></tr>`)
        .join('')}</table>`).join('\n')}`);
