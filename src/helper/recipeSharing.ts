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
