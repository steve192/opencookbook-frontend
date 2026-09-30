import {describe, expect, it} from 'vitest';
import {instanceFeatures} from './instanceFeatures';

describe('instanceFeatures', () => {
  it('assumes sharing and households but neither scanning nor api keys before the instance said', () => {
    expect(instanceFeatures()).toEqual(
        {sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false, apiKeysEnabled: false});
  });

  it.each([true, false])('takes what the instance offers: %s', (enabled) => {
    expect(instanceFeatures({termsOfService: '', sharingEnabled: enabled, householdsEnabled: enabled,
      ocrImportEnabled: enabled, apiKeysEnabled: enabled})).toEqual(
        {sharingEnabled: enabled, householdsEnabled: enabled, ocrImportEnabled: enabled, apiKeysEnabled: enabled});
  });
});
