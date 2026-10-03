import {useLinkingURL} from 'expo-linking';
import {useMemo} from 'react';
import {LINK_SEGMENTS, parseAppLink} from './appLink';

type LinkSegment = (typeof LINK_SEGMENTS)[keyof typeof LINK_SEGMENTS];

/**
 * The instance the opened link named, if it named one.
 *
 * The route only carries the identifier, which is all the navigator matches on, but which server
 * the link lives on is in the link too. A link to somebody else's instance has to be resolved
 * there rather than against whatever server the app happens to be signed in to.
 *
 * @param {string} segment the path segment naming the kind of link
 * @param {string} id the identifier the screen was opened for
 * @return {string | undefined} the instance from the link, or undefined when it named none
 */
export const useAppLinkOrigin = (segment: LinkSegment, id: string): string | undefined => {
  const openedUrl = useLinkingURL();

  return useMemo(() => {
    const link = openedUrl ? parseAppLink(openedUrl, segment) : undefined;
    // Ignore a url that has moved on to another link, which happens when a second link is
    // opened while the first one is still on screen.
    return link?.id === id ? link.origin : undefined;
  }, [openedUrl, segment, id]);
};
