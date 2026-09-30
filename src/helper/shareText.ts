import {Share} from 'react-native';

/** What happened when text was handed to the platform. */
export type ShareOutcome =
  /** The share sheet was opened and something was chosen. */
  | 'shared'
  /** No share sheet was available, so the text went to the clipboard instead. */
  | 'copied'
  /** The share sheet was opened and dismissed. */
  | 'dismissed';

/** Whether shareText copies instead of opening a share sheet. */
export const SHARE_TEXT_COPIES = false;

/**
 * Hands text, such as a secret, to another app.
 *
 * @param {string} text what to hand over
 * @return {Promise<ShareOutcome>} what the platform did with it
 */
export const shareText = async (text: string): Promise<ShareOutcome> => {
  const result = await Share.share({message: text});
  return result.action === Share.sharedAction ? 'shared' : 'dismissed';
};
