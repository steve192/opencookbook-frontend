import {shareMessage} from './recipeSharing';
import {ShareOutcome, shareText} from './shareText';

/**
 * Hands a share link to the operating system.
 *
 * @param {string} title what is being shared: a recipe title or a household name
 * @param {string} url its share link
 * @return {Promise<ShareOutcome>} what the platform did with it
 */
export const shareLink = (title: string, url: string): Promise<ShareOutcome> =>
  shareText(shareMessage(title, url));
