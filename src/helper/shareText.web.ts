// Type only, and erased at compile time: on web this module resolves to itself, so an import
// that survived to runtime would be a cycle. Mirrors how timerNotifications.web.ts is written.
import type {ShareOutcome} from './shareText';

export const SHARE_TEXT_COPIES = true;

/**
 * Copies text, such as a secret: a share sheet on a computer rarely offers the clipboard.
 *
 * @param {string} text what to hand over
 * @return {Promise<ShareOutcome>} always copied
 */
export const shareText = async (text: string): Promise<ShareOutcome> => {
  await navigator.clipboard.writeText(text);
  return 'copied';
};
