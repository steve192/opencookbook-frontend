/**
 * A deployed web app and its API share one origin, which also serves somebody who never signed in.
 *
 * @return {string} the backend url
 */
export const defaultBackendUrl = (): string => window.location.origin;
