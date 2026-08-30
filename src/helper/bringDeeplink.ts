import axios from 'axios';

export const BRING_DEEPLINK_API = 'https://api.getbring.com/rest/bringrecipes/deeplink';

const APPSFLYER_LINK_PREFIX = 'https://getbring.onelink.me/';
const BRING_HTTPS_LINK = /^https:\/\/([a-z0-9-]+\.)*getbring\.com\//;
const UNWRAP_TIMEOUT_MS = 4000;

/**
 * Tries to look up the deeplink bring hides behind its AppsFlyer short link.
 *
 * The documented api hands out a getbring.onelink.me link. Opening that on android starts
 * bring's AppsFlyer attribution activity, which has to resolve the short code over the network
 * before it knows what to import. When that resolve is slow or fails, the activity stays up as
 * an invisible window on top of us and nothing is imported. The short link redirects to a url
 * carrying the very deeplink it would have resolved to in deep_link_value, so following it here
 * lets us open bring's import directly and skip the attribution round trip on the device.
 *
 * Nothing about the deeplink format is hardcoded, it is only carried over. If bring stops
 * handing one out, changes its shape or is simply not reachable, this returns null and the
 * caller opens the official short link.
 *
 * @param {string} shortLink deeplink as returned by the documented bring api
 * @return {Promise<string | null>} direct bring deeplink, or null to fall back to shortLink
 */
export const unwrapBringDeeplink = async (shortLink: string): Promise<string | null> => {
  try {
    if (!shortLink.startsWith(APPSFLYER_LINK_PREFIX)) {
      // Not an AppsFlyer link (anymore), so there is nothing to skip
      return null;
    }

    // React native follows redirects on its own, responseURL holds where we ended up
    const response = await axios.get(shortLink, {timeout: UNWRAP_TIMEOUT_MS});
    const finalUrl: string | undefined = response.request?.responseURL;
    if (!finalUrl) {
      return null;
    }

    const deepLinkValue = /[?&]deep_link_value=([^&]+)/.exec(finalUrl);
    if (!deepLinkValue) {
      return null;
    }
    const directLink = decodeURIComponent(deepLinkValue[1]);

    // Only ever hand a bring owned https link to the os, never a store page or custom scheme
    return BRING_HTTPS_LINK.test(directLink) ? directLink : null;
  } catch (error) {
    return null;
  }
};
