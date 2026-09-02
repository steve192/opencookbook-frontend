import {describe, expect, it} from 'vitest';
import {
  formatShareExpiry,
  isSameInstance,
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

describe('isSameInstance', () => {
  // Every one of these is a way of writing the same server, and every one of them would
  // otherwise put a "this recipe lives somewhere else" notice in front of somebody who is
  // looking at their own instance.
  it.each([
    ['https://beta.cookpal.io', 'https://beta.cookpal.io/'],
    ['https://beta.cookpal.io/', 'https://BETA.cookpal.io'],
    ['https://BETA.CookPal.io/some/path', 'https://beta.cookpal.io'],
    ['https://beta.cookpal.io:443', 'https://beta.cookpal.io'],
    ['http://beta.cookpal.io:80', 'http://beta.cookpal.io/'],
    ['http://localhost:8081', 'http://localhost:8081/share/abc'],
  ])('treats %s and %s as one server', (one, other) => {
    expect(isSameInstance(one, other)).toBe(true);
  });

  it.each([
    ['https://beta.cookpal.io', 'https://cookbook.example.com'],
    ['https://beta.cookpal.io', 'http://beta.cookpal.io'],
    ['http://localhost:8081', 'http://localhost:9090'],
  ])('keeps %s and %s apart', (one, other) => {
    expect(isSameInstance(one, other)).toBe(false);
  });

  it('has nothing to compare when a link names no host at all', () => {
    expect(isSameInstance('cookpal://share/7f3a', 'https://beta.cookpal.io')).toBe(false);
  });

  it('does not consider two unknowns to be the same server', () => {
    expect(isSameInstance(undefined, undefined)).toBe(false);
  });
});

describe('shareMessage', () => {
  it('leads with the title, because nothing else will say what the link is', () => {
    expect(shareMessage('Lasagne', 'https://beta.cookpal.io/share/abc'))
        .toBe('Lasagne — https://beta.cookpal.io/share/abc');
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
