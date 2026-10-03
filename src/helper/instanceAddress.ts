import {BASE_PATH} from '../navigation/basePath';

const ORIGIN = /^(https?):\/\/([^/?#:]+)(?::(\d+))?/i;
const DEFAULT_PORTS: Record<string, string> = {'http': '80', 'https': '443'};

/**
 * An address reduced to the instance it names, so two spellings of one server compare equal.
 *
 * @param {string} url any absolute http(s) address
 * @return {string | undefined} scheme, host and non default port, lowercased
 */
export const normalizeOrigin = (url: string): string | undefined => {
  const parts = ORIGIN.exec(url.trim());
  if (!parts) {
    return undefined;
  }
  const [, scheme, host, port] = parts;
  const lowercaseScheme = scheme.toLowerCase();
  const meaningfulPort = port && port !== DEFAULT_PORTS[lowercaseScheme] ? `:${port}` : '';
  return `${lowercaseScheme}://${host.toLowerCase()}${meaningfulPort}`;
};

/**
 * Whether two addresses name the same instance.
 *
 * Trailing slashes, capitalisation and an explicitly written default port are all ways of
 * spelling the same server, and every one of them would otherwise put a "this recipe lives
 * somewhere else" notice in front of somebody looking at their own instance.
 *
 * @param {string} [one] an address
 * @param {string} [other] another address
 * @return {boolean} true when both name the same instance
 */
export const isSameInstance = (one?: string, other?: string): boolean => {
  const normalizedOne = one ? normalizeOrigin(one) : undefined;
  const normalizedOther = other ? normalizeOrigin(other) : undefined;
  return normalizedOne !== undefined && normalizedOne === normalizedOther;
};

/**
 * What a person typed as a server address, as it is stored: without trailing slashes and without
 * the base path, which people copy along from the browser's address bar.
 *
 * @param {string} typed the address as typed
 * @return {string} the address of the instance
 */
export const normalizeServerAddress = (typed: string): string => {
  const withoutSlashes = (text: string) => text.replace(/\/+$/, '');
  const address = withoutSlashes(typed.trim());
  return withoutSlashes(address.endsWith(BASE_PATH) ? address.slice(0, -BASE_PATH.length) : address);
};

/**
 * Where an instance's administration lives, which is also where it is set up.
 *
 * @param {string} instance the address of the instance
 * @return {string} the address of its administration
 */
export const adminAddress = (instance: string): string => `${normalizeServerAddress(instance)}/admin`;
