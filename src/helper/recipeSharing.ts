/**
 * The rules a share link follows, kept away from anything that renders.
 *
 * A link is the whole of the feature from a recipient's point of view, so how one is built,
 * read back and matched against the server the app is signed in to is worth being able to test
 * exhaustively - which none of it is once it lives inside a screen.
 */

import {BASE_PATH} from '../navigation/basePath';
import {normalizeOrigin} from './instanceAddress';

/** The path a shared recipe lives under, on every instance. */
const SHARE_PATH_SEGMENT = 'share';

/** What a share link says: which share, and which instance it lives on. */
export interface ShareLink {
  shareId: string;
  /**
   * Where the share is hosted. Absent for a link that carries no host of its own - the app's
   * own {@code cookpal://} scheme - which can only ever mean the instance already configured.
   */
  origin?: string;
}

// Only http(s) links carry an instance. Anything else - the app's own scheme included - has a
// share id but no host worth resolving against. The web app sits under the base path; links of
// the retired address do not have it.
const WEB_SHARE_LINK = new RegExp(
    `^(https?://[^/?#]+)(?:${BASE_PATH})?/${SHARE_PATH_SEGMENT}/([^/?#]+)`, 'i');
const SCHEME_SHARE_LINK = new RegExp(`^[a-z][a-z0-9+.-]*:(?://[^/?#]*)?/?${SHARE_PATH_SEGMENT}/([^/?#]+)`, 'i');

/**
 * Reads a share link back.
 *
 * @param {string} url the link that was opened
 * @return {ShareLink | undefined} what it addresses, or undefined if it is not a share link
 */
export const parseShareLink = (url: string): ShareLink | undefined => {
  const webLink = WEB_SHARE_LINK.exec(url.trim());
  if (webLink) {
    return {origin: normalizeOrigin(webLink[1]), shareId: decodeURIComponent(webLink[2])};
  }

  const schemeLink = SCHEME_SHARE_LINK.exec(url.trim());
  return schemeLink ? {shareId: decodeURIComponent(schemeLink[1])} : undefined;
};

/**
 * What gets handed to the share sheet.
 *
 * The title is in the message rather than left to the link because the instance serves the app
 * as a single page: no crawler ever sees the recipe, so a bare link arrives in a chat with
 * nothing to say what it is.
 *
 * @param {string} title the recipe being shared
 * @param {string} url its share link
 * @return {string} the message to send
 */
export const shareMessage = (title: string, url: string): string => `${title} - ${url}`;

/**
 * When a link stops working, as a date on its own.
 *
 * Shares expire on a fixed date rather than on use, so this is the only warning an owner gets
 * before a link they have already handed out goes dead. The time of day is not shown: it is
 * noise next to a date that is months away.
 *
 * @param {string} expiresAt the expiry as an ISO instant
 * @param {string} [locale] the locale to format in
 * @return {string | undefined} the date, or undefined if the instant cannot be read
 */
export const formatShareExpiry = (expiresAt: string, locale?: string): string | undefined => {
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) {
    return undefined;
  }
  return expiry.toLocaleDateString(locale, {year: 'numeric', month: 'long', day: 'numeric'});
};
