import {describe, expect, it} from 'vitest';
import {formatShareExpiry, shareMessage} from './recipeSharing';

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
