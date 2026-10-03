import {describe, expect, it} from 'vitest';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import {translationAt} from '../i18n/translationAt';
import {SIGNUP_OUTCOME_KEYS} from './signupOutcome';

describe('every way a sign up can end can be said out loud', () => {
  const keys = Object.values(SIGNUP_OUTCOME_KEYS).flatMap(({title, message}) => [title, message]);

  it.each(keys)('%s exists in English and German', (key) => {
    expect(translationAt(en, key)).toBeTypeOf('string');
    expect(translationAt(de, key)).toBeTypeOf('string');
  });
});
