import {describe, expect, it} from 'vitest';
import {buildWeekplanPrintHtml, PrintableWeekplan} from './weekplanPrint';

const weekplan = (overrides: Partial<PrintableWeekplan> = {}): PrintableWeekplan => ({
  title: 'This week',
  subtitle: '31 – 6 Sep 2026',
  emptyLabel: 'Nothing planned',
  days: [
    {weekday: 'Monday', date: '31 August', meals: ['Lasagne', 'Salad']},
    {weekday: 'Tuesday', date: '1 September', meals: []},
  ],
  ...overrides,
});

describe('buildWeekplanPrintHtml', () => {
  it('produces a complete document', () => {
    const html = buildWeekplanPrintHtml(weekplan());
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html.trimEnd().endsWith('</html>')).toBe(true);
  });

  it('puts the week in the heading and the document title', () => {
    const html = buildWeekplanPrintHtml(weekplan({title: 'Week 42'}));
    expect(html).toContain('<title>Week 42</title>');
    expect(html).toContain('<h1>Week 42</h1>');
  });

  it('lists every day with its date', () => {
    const html = buildWeekplanPrintHtml(weekplan());
    expect(html).toContain('Monday');
    expect(html).toContain('31 August');
    expect(html).toContain('Tuesday');
    expect(html).toContain('1 September');
  });

  it('lists the meals of a day in order', () => {
    const html = buildWeekplanPrintHtml(weekplan());
    expect(html).toContain('<li>Lasagne</li><li>Salad</li>');
  });

  it('marks a day without meals instead of leaving it blank', () => {
    const html = buildWeekplanPrintHtml(weekplan());
    expect(html).toContain('Nothing planned');
  });

  // Recipe titles are user content, and they are pasted straight into markup.
  it('escapes markup in a recipe title', () => {
    const html = buildWeekplanPrintHtml(weekplan({
      days: [{weekday: 'Monday', date: '31 August', meals: ['<script>alert("x")</script>']}],
    }));
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes markup in the title', () => {
    const html = buildWeekplanPrintHtml(weekplan({title: 'Week <b>1</b>'}));
    expect(html).not.toContain('<b>');
    expect(html).toContain('Week &lt;b&gt;1&lt;/b&gt;');
  });

  it('keeps ampersands readable', () => {
    const html = buildWeekplanPrintHtml(weekplan({
      days: [{weekday: 'Monday', date: '31 August', meals: ['Fish & chips']}],
    }));
    expect(html).toContain('Fish &amp; chips');
  });

  it('avoids splitting a day across pages', () => {
    expect(buildWeekplanPrintHtml(weekplan())).toContain('page-break-inside: avoid');
  });

  it('handles a week with no days at all', () => {
    const html = buildWeekplanPrintHtml(weekplan({days: []}));
    expect(html).toContain('<body>');
    expect(html).not.toContain('class="day"');
  });
});

// The sheet has to come out the same on every platform, so the document itself
// carries the page setup rather than relying on a print dialog's defaults.
describe('page setup', () => {
  it('asks for a portrait A4 page', () => {
    expect(buildWeekplanPrintHtml(weekplan())).toContain('size: A4 portrait');
  });

  it('caps the body at the printable width of that page', () => {
    // 210mm wide minus the 14mm margins on both sides
    expect(buildWeekplanPrintHtml(weekplan())).toContain('max-width: 182mm');
  });

  // Android sizes the page from its own print dialog, so the sheet has to fill
  // whatever it is handed rather than assume A4.
  it('lets the sheet fill a page of another size', () => {
    expect(buildWeekplanPrintHtml(weekplan())).toContain('width: 100%');
  });

  // Android WebView drops background colours when printing unless asked otherwise,
  // which would lose the band behind every weekday.
  it('keeps background colours when printing', () => {
    expect(buildWeekplanPrintHtml(weekplan())).toContain('print-color-adjust: exact');
  });
});
