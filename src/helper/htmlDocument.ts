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
