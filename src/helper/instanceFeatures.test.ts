import {describe, expect, it} from 'vitest';
import {instanceFeatures} from './instanceFeatures';

describe('instanceFeatures', () => {
  it('assumes sharing and households but neither scanning nor api keys before the instance said', () => {
    expect(instanceFeatures()).toMatchObject(
        {sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false, apiKeysEnabled: false});
  });

  it('assumes an instance that is set up, open for sign ups and able to send mail before it said', () => {
    expect(instanceFeatures()).toMatchObject({setupRequired: false, signupMode: 'OPEN', mailEnabled: true});
  });

  it('takes the setup state, the registration mode and the mail ability the instance reports', () => {
    expect(instanceFeatures({sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false,
      apiKeysEnabled: false, setupRequired: true, signupMode: 'INVITATION_ONLY', mailEnabled: false, googleSignIn: null}))
        .toMatchObject({setupRequired: true, signupMode: 'INVITATION_ONLY', mailEnabled: false});
  });

  it.each([true, false])('takes what the instance offers: %s', (enabled) => {
    expect(instanceFeatures({sharingEnabled: enabled, householdsEnabled: enabled,
      ocrImportEnabled: enabled, apiKeysEnabled: enabled, setupRequired: false, signupMode: 'OPEN',
      mailEnabled: true, googleSignIn: null})).toMatchObject(
        {sharingEnabled: enabled, householdsEnabled: enabled, ocrImportEnabled: enabled, apiKeysEnabled: enabled});
  });

  it('offers Google only once the instance names its clients', () => {
    const googleSignIn = {clientId: 'web.apps.googleusercontent.com', androidClientId: null};
    expect(instanceFeatures().googleSignIn).toBeNull();
    expect(instanceFeatures({sharingEnabled: true, householdsEnabled: true, ocrImportEnabled: false,
      apiKeysEnabled: false, setupRequired: false, signupMode: 'OPEN', mailEnabled: true, googleSignIn})
        .googleSignIn).toEqual(googleSignIn);
  });
});
