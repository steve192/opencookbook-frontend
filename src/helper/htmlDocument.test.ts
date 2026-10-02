import {describe, expect, it} from 'vitest';
import {toHtmlDocument} from './htmlDocument';

describe('toHtmlDocument', () => {
  const html = toHtmlDocument('<p>Hello</p>', {onBackground: '#111', background: '#fafafa', primary: '#0a0'});

  it('keeps the fragment as is', () => {
    expect(html).toContain('<p>Hello</p>');
  });

  it('declares charset, viewport and link target', () => {
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('<base target="_blank">');
  });

  it('applies the colours', () => {
    expect(html).toContain('color: #111');
    expect(html).toContain('background: #fafafa');
    expect(html).toContain('a { color: #0a0; }');
  });
});
