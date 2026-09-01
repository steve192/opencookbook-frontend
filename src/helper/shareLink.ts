import {Share} from 'react-native';
import {shareMessage} from './recipeSharing';

/** What happened when a link was handed to the platform. */
export type ShareOutcome =
  /** The share sheet was opened and something was chosen. */
  | 'shared'
  /** No share sheet was available, so the link went to the clipboard instead. */
  | 'copied'
  /** The share sheet was opened and dismissed. */
  | 'dismissed';

/**
 * Hands a share link to the operating system.
 *
 * @param {string} title the recipe being shared
 * @param {string} url its share link
 * @return {Promise<ShareOutcome>} what the platform did with it
 */
export const shareRecipeLink = async (title: string, url: string): Promise<ShareOutcome> => {
  const result = await Share.share({message: shareMessage(title, url)});
  return result.action === Share.sharedAction ? 'shared' : 'dismissed';
};
