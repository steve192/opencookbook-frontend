/**
 * Adds what is asked for now to what was asked for before, the way the server does: "1 l + 500 ml".
 *
 * @param {string} first what was there
 * @param {string} second what is added
 * @return {string | null} both, or whichever is not blank
 */
export const joinSpecs = (first: string | null | undefined, second: string | null | undefined): string | null => {
  const before = first?.trim() || null;
  const added = second?.trim() || null;
  if (before === null) {
    return added;
  }
  return added === null ? before : `${before} + ${added}`;
};
