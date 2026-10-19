export interface HtmlDocumentColors {
  onBackground: string;
  background: string;
  primary: string;
}

/**
 * Wraps an HTML fragment into a complete, themed document.
 *
 * @param {string} fragment trusted HTML fragment, inserted as is
 * @param {HtmlDocumentColors} colors colours of the surrounding app
 * @return {string} the complete HTML document
 */
export const toHtmlDocument = (fragment: string, colors: HtmlDocumentColors): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_blank">
<style>
  html { background: ${colors.background}; color: ${colors.onBackground}; }
  body {
    margin: 0 auto;
    padding: 16px;
    max-width: 48rem;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  a { color: ${colors.primary}; }
</style>
</head>
<body>
${fragment}
</body>
</html>`;

/**
 * Wraps a fragment into a document for printing on A4, dark on white.
 *
 * @param {string} title the document title, escaped here
 * @param {string} style the document's own rules, after the shared page setup
 * @param {string} body trusted HTML fragment, inserted as is
 * @return {string} the complete HTML document
 */
export const toPrintDocument = (title: string, style: string, body: string): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #111;
    /* Android takes the page size from its own print dialog rather than from @page,
       so the sheet fills whatever page it is given and only caps at the printable
       width of an A4 page, which is what the web build lays out in. */
    width: 100%;
    max-width: 182mm;
    margin: 0 auto;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
${style}
</style>
</head>
<body>
${body}
</body>
</html>`;

/**
 * User content and translated texts end up inside markup.
 *
 * @param {string} value text to put into a document
 * @return {string} the text with the markup characters escaped
 */
export const escapeHtml = (value: string): string =>
  value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#39;');
