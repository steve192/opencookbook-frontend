import {ApiScope} from '../dao/RestAPI';

interface ScopeFacts {
  labelKey: `screens.apiKeys.scopes.${'shoppingRead' | 'shoppingWrite'}`;
  /** Mirrors the scope the server adds, so the ticks show what a key will get. */
  implies?: ApiScope;
}

const SCOPES: Record<ApiScope, ScopeFacts> = {
  'shopping:read': {labelKey: 'screens.apiKeys.scopes.shoppingRead'},
  'shopping:write': {labelKey: 'screens.apiKeys.scopes.shoppingWrite', implies: 'shopping:read'},
};

/** Every scope a key can be given, grouped by feature, in the order the app offers them. */
export const API_SCOPE_GROUPS = [
  {labelKey: 'screens.apiKeys.features.shopping', scopes: ['shopping:read', 'shopping:write']},
] as const satisfies readonly {labelKey: string, scopes: readonly ApiScope[]}[];

/**
 * Ticks or unticks one scope: ticking a write scope ticks its read scope, unticking a read
 * scope unticks the write scopes that need it.
 *
 * @param {ApiScope[]} chosen what is ticked now
 * @param {ApiScope} scope the one pressed
 * @return {ApiScope[]} what is ticked after
 */
export const toggleScope = (chosen: readonly ApiScope[], scope: ApiScope): ApiScope[] => {
  if (chosen.includes(scope)) {
    return chosen.filter((kept) => kept !== scope && SCOPES[kept].implies !== scope);
  }
  const implied = SCOPES[scope].implies;
  return [...chosen, scope, ...(implied && !chosen.includes(implied) ? [implied] : [])];
};

/**
 * @param {ApiScope} scope as the server names it
 * @return {string} the key of its label
 */
export const scopeLabelKey = (scope: ApiScope) => SCOPES[scope].labelKey;
