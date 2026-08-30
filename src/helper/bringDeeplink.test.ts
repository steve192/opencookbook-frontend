import {describe, expect, it, vi, beforeEach} from 'vitest';
import axios from 'axios';
import {unwrapBringDeeplink} from './bringDeeplink';

vi.mock('axios');

const SHORT_LINK = 'https://getbring.onelink.me/ZAzR/b5yc1i5z';
const DIRECT_LINK = 'https://deeplink.getbring.com/import?type=RECIPE&src=aHR0cHM6Ly9leGFtcGxl';

/** @param {string} finalUrl url the redirect chain ended at @return {object} axios response */
const respondingWith = (finalUrl: string | undefined) => {
  vi.mocked(axios.get).mockResolvedValue({request: {responseURL: finalUrl}});
};

describe('unwrapBringDeeplink', () => {
  beforeEach(() => vi.resetAllMocks());

  it('carries over the deeplink bring redirects to', async () => {
    respondingWith('https://web.getbring.com/?deep_link_value=' + encodeURIComponent(DIRECT_LINK) + '&pid=importDeeplink');

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBe(DIRECT_LINK);
  });

  it('finds the deeplink when it is the only parameter', async () => {
    respondingWith('https://web.getbring.com/?deep_link_value=' + encodeURIComponent(DIRECT_LINK));

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBe(DIRECT_LINK);
  });

  it('falls back when bring stops handing out an appsflyer link', async () => {
    expect(await unwrapBringDeeplink('https://deeplink.getbring.com/import?type=RECIPE')).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('falls back when the redirect carries no deeplink', async () => {
    respondingWith('https://play.google.com/store/apps/details?id=ch.publisheria.bring');

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });

  it('falls back when the redirect chain is not observable', async () => {
    respondingWith(undefined);

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });

  it('falls back rather than opening a link outside of bring', async () => {
    respondingWith('https://web.getbring.com/?deep_link_value=' + encodeURIComponent('https://evil.example.com/import'));

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });

  it('falls back rather than opening a non https scheme', async () => {
    respondingWith('https://web.getbring.com/?deep_link_value=' + encodeURIComponent('market://details?id=ch.publisheria.bring'));

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });

  it('is not fooled by a host that merely ends in the bring domain', async () => {
    respondingWith('https://web.getbring.com/?deep_link_value=' + encodeURIComponent('https://notgetbring.com/import'));

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });

  it('falls back when bring cannot be reached', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('timeout of 4000ms exceeded'));

    expect(await unwrapBringDeeplink(SHORT_LINK)).toBeNull();
  });
});
