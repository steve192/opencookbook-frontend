import {describe, expect, it} from 'vitest';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import {MESSAGE_KEYS} from './apiErrorMessage';

/**
 * A code the server sends that this app has no wording for falls back to something generic,
 * which is a safe way to be wrong. A code it claims to have wording for and does not is worse:
 * i18next renders the key itself, so the reader is shown "errors.somethingNew".
 *
 * @param {object} translations one locale's messages
 * @param {string} key the dotted path to look up
 * @return {unknown} what is there, if anything
 */
const resolve = (translations: object, key: string): unknown =>
  key.split('.').reduce<unknown>(
      (branch, segment) =>
        (branch && typeof branch === 'object' ?
          (branch as Record<string, unknown>)[segment] :
          undefined),
      translations);

describe('every failure the app names can be said out loud', () => {
  const keys = [...new Set(Object.values(MESSAGE_KEYS)), 'errors.unknown'];

  it.each(keys)('%s exists in English', (key) => {
    expect(resolve(en, key)).toBeTypeOf('string');
  });

  it.each(keys)('%s exists in German', (key) => {
    expect(resolve(de, key)).toBeTypeOf('string');
  });
});
