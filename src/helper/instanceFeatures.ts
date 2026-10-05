import {InstanceInfo} from '../api/types/account';

export type InstanceFeatures = Pick<InstanceInfo, 'sharingEnabled' | 'householdsEnabled' | 'ocrImportEnabled' |
  'apiKeysEnabled' |
  'setupRequired' | 'signupMode' | 'mailEnabled' | 'googleSignIn'>;

/**
 * What an instance offers, with what to assume until it has said.
 *
 * @param {InstanceInfo} [info] what the instance said, if it has
 * @return {InstanceFeatures} the features to offer
 */
export const instanceFeatures = (info?: InstanceInfo): InstanceFeatures => ({
  // Assumed on, so a slow or failed lookup does not take a working feature away.
  sharingEnabled: info?.sharingEnabled ?? true,
  householdsEnabled: info?.householdsEnabled ?? true,
  // Assumed off: most instances have no scanning, and offering one that cannot work is worse.
  ocrImportEnabled: info?.ocrImportEnabled ?? false,
  apiKeysEnabled: info?.apiKeysEnabled ?? false,
  // Assumed set up, open and mailing: what the forms did before the instance said otherwise.
  setupRequired: info?.setupRequired ?? false,
  signupMode: info?.signupMode ?? 'OPEN',
  mailEnabled: info?.mailEnabled ?? true,
  googleSignIn: info?.googleSignIn ?? null,
});
