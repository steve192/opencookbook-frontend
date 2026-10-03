/**
 * Reading back the links the app hands out, whichever kind they are: a share, an invitation.
 * They all look alike, one path segment naming the kind followed by an identifier.
 */

import {BASE_PATH} from '../navigation/basePath';
import {normalizeOrigin} from './instanceAddress';

/** The path segment each kind of link lives under, on every instance. */
export const LINK_SEGMENTS = {share: 'share', invitation: 'invite'} as const;

/** What a link says: which thing it addresses, and which instance it lives on. */
export interface AppLink {
  id: string;
  /**
   * Where it is hosted. Absent for a link that carries no host of its own, such as the app's own
   * cookpal:// scheme, which can only ever mean the instance already configured.
   */
  origin?: string;
}

/**
 * Reads a link of one kind back.
 *
 * Only http(s) links carry an instance; anything else, the app's own scheme included, has an
 * identifier but no host worth resolving against. The web app sits under the base path; links
 * of the retired address do not have it.
 *
 * @param {string} url the link that was opened
 * @param {string} segment the path segment naming the kind of link
 * @return {AppLink | undefined} what it addresses, or undefined if it is not a link of that kind
 */
export const parseAppLink = (url: string, segment: string): AppLink | undefined => {
  const trimmed = url.trim();
  const webLink = new RegExp(`^(https?://[^/?#]+)(?:${BASE_PATH})?/${segment}/([^/?#]+)`, 'i').exec(trimmed);
  if (webLink) {
    return {origin: normalizeOrigin(webLink[1]), id: decodeURIComponent(webLink[2])};
  }

  const schemeLink = new RegExp(`^[a-z][a-z0-9+.-]*:(?://[^/?#]*)?/?${segment}/([^/?#]+)`, 'i').exec(trimmed);
  return schemeLink ? {id: decodeURIComponent(schemeLink[1])} : undefined;
};
