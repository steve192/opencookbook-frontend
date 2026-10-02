import {describe, expect, it} from 'vitest';
import {
  formatShareExpiry,
  parseShareLink,
  shareMessage,
} from './recipeSharing';

describe('parseShareLink', () => {
  it('reads the share and the instance out of a web link', () => {
    expect(parseShareLink('https://beta.cookpal.io/share/7f3a1c2e')).toEqual({
      origin: 'https://beta.cookpal.io',
      shareId: '7f3a1c2e',
    });
  });

  it('survives a query string and a fragment', () => {
    expect(parseShareLink('https://beta.cookpal.io/share/7f3a?from=chat#top')?.shareId).toBe('7f3a');
  });

  it('reads a link under the base path', () => {
    expect(parseShareLink('https://cookpal.io/app/share/7f3a')).toEqual({
      origin: 'https://cookpal.io',
      shareId: '7f3a',
    });
  });

  it('still reads a link of the retired address, which has no base path', () => {
    expect(parseShareLink('https://beta.cookpal.io/share/x')).toEqual({
      origin: 'https://beta.cookpal.io',
      shareId: 'x',
    });
  });

  it('reads a link opened through the app scheme, which names no instance', () => {
    expect(parseShareLink('cookpal://share/7f3a')).toEqual({shareId: '7f3a'});
  });

  it('reads an expo development link, where the scheme carries a host of its own', () => {
    expect(parseShareLink('exp://192.168.0.2:8081/share/7f3a')).toEqual({shareId: '7f3a'});
  });

  it('decodes an escaped share id', () => {
    expect(parseShareLink('https://beta.cookpal.io/share/a%2Bb')?.shareId).toBe('a+b');
  });

  it('is not fooled by another route', () => {
    expect(parseShareLink('https://beta.cookpal.io/recipe/12')).toBeUndefined();
  });

  it('rejects something that is not a link at all', () => {
    expect(parseShareLink('share/7f3a')).toBeUndefined();
  });
});

describe('shareMessage', () => {
  it('leads with the title, because nothing else will say what the link is', () => {
    expect(shareMessage('Lasagne', 'https://beta.cookpal.io/share/abc'))
        .toBe('Lasagne - https://beta.cookpal.io/share/abc');
  });
});

describe('formatShareExpiry', () => {
  it('shows the day without the time', () => {
    expect(formatShareExpiry('2027-09-04T10:15:30Z', 'en-GB')).toBe('4 September 2027');
  });

  it('formats in the given locale', () => {
    expect(formatShareExpiry('2027-09-04T10:15:30Z', 'de-DE')).toBe('4. September 2027');
  });

  it('says nothing about an unreadable instant', () => {
    expect(formatShareExpiry('not a date')).toBeUndefined();
  });
});
