import {shareMessage} from './recipeSharing';
// Type only, and erased at compile time: on web this module resolves to itself, so an import
// that survived to runtime would be a cycle. Mirrors how timerNotifications.web.ts is written.
import type {ShareOutcome} from './shareLink';

/**
 * Hands a share link to the browser.
 *
 * The Web Share API only exists on some browsers, and only in a secure context, so the
 * clipboard is the fallback rather than the exception - a self hosted instance reached over
 * plain http will always land there.
 *
 * @param {string} title the recipe being shared
 * @param {string} url its share link
 * @return {Promise<ShareOutcome>} what the browser did with it
 */
export const shareRecipeLink = async (title: string, url: string): Promise<ShareOutcome> => {
  const message = shareMessage(title, url);

  if (navigator.share) {
    try {
      await navigator.share({title: title, text: message, url: url});
      return 'shared';
    } catch (e) {
      // A dismissed sheet and a browser that refuses to open one are indistinguishable here,
      // so fall through to the clipboard rather than leaving the user with nothing.
    }
  }

  await navigator.clipboard.writeText(message);
  return 'copied';
};
