import {describe, expect, it} from 'vitest';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import {translationAt} from '../i18n/translationAt';
import {API_SCOPE_GROUPS, scopeLabelKey, toggleScope} from './apiScopes';

describe('toggleScope', () => {
  it('ticks the read scope with its write scope', () => {
    expect(toggleScope([], 'shopping:write')).toEqual(['shopping:write', 'shopping:read']);
  });

  it('ticks a read scope alone', () => {
    expect(toggleScope([], 'shopping:read')).toEqual(['shopping:read']);
  });

  it('unticks the write scope with the read scope it needs', () => {
    expect(toggleScope(['shopping:read', 'shopping:write'], 'shopping:read')).toEqual([]);
  });

  it('keeps reading when writing is unticked', () => {
    expect(toggleScope(['shopping:read', 'shopping:write'], 'shopping:write')).toEqual(['shopping:read']);
  });
});

describe('every scope can be named', () => {
  const keys = API_SCOPE_GROUPS.flatMap((group) => [group.labelKey, ...group.scopes.map(scopeLabelKey)]);

  it.each(keys)('%s exists in English and German', (key) => {
    expect(translationAt(en, key)).toBeTypeOf('string');
    expect(translationAt(de, key)).toBeTypeOf('string');
  });
});
