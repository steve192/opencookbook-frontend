import {useEffect, useRef} from 'react';
import RestAPI, {RecipeDiet} from '../dao/RestAPI';

/** Long enough that typing an ingredient's name does not ask after every letter. */
const DEBOUNCE_MS = 600;

/**
 * Keeps a recipe's diet in step with its ingredients, read from the catalogue by the server.
 *
 * @param {string[]} ingredientNames the ingredients as written so far
 * @param {boolean} enabled false once the cook chose a diet themselves
 * @param {Function} onDerived receives the diet, null where the ingredients do not tell
 */
export const useDerivedDiet = (
    ingredientNames: string[],
    enabled: boolean,
    onDerived: (diet: RecipeDiet | null) => void,
) => {
  const names = ingredientNames.map((name) => name.trim()).filter((name) => name !== '');
  const key = names.join('\n');
  const latestOnDerived = useRef(onDerived);
  latestOnDerived.current = onDerived;
  useEffect(() => {
    if (!enabled || names.length === 0) {
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      // Where the instance does not estimate nutrition there is nothing to read; the diet stays as it is
      RestAPI.previewDiet(names)
          .then((diet) => current && latestOnDerived.current(diet))
          .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
    // Keyed on the names' content, not the array, which is new on every render
  }, [key, enabled]);
};
