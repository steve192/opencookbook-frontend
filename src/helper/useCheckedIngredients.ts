import {useCallback, useState} from 'react';

export interface CheckedIngredients {
  /** Indexes, in the recipe's ingredient list, of everything ticked off */
  checked: Set<number>;
  toggle: (index: number) => void;
  reset: () => void;
}

/**
 * Which ingredients have been dealt with.
 *
 * Held by the index of the ingredient in the recipe rather than by its position in whatever
 * list is being shown, so a screen that splits the ingredients over several lists still
 * agrees with itself about what has been ticked off.
 *
 * @return {CheckedIngredients} the ticked off ingredients and the ways to change them
 */
export const useCheckedIngredients = (): CheckedIngredients => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = useCallback((index: number) => {
    setChecked((previous) => {
      const next = new Set(previous);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  const reset = useCallback(() => setChecked(new Set()), []);

  return {checked, toggle, reset};
};
