/**
 * @param {object} translations one locale's messages
 * @param {string} key the dotted path to look up
 * @return {unknown} what is there, if anything
 */
export const translationAt = (translations: object, key: string): unknown =>
  key.split('.').reduce<unknown>(
      (branch, segment) =>
        (branch && typeof branch === 'object' ? (branch as Record<string, unknown>)[segment] : undefined),
      translations);
