import {useEffect, useRef} from 'react';
import {useReadIngredientLinesMutation} from '../api/endpoints/recipes';
import {Ingredient, IngredientUse} from '../api/types/recipes';
import {useIsOnline} from '../offline/useIsOnline';
import {EditedRecipe, unreadIngredientTexts, withIngredientsRead} from './recipeEdits';

/** Long enough that a row is not read after every letter. */
const DEBOUNCE_MS = 600;

/**
 * Has the server read what was typed into the ingredient rows, as an import reads its lines: a moment after
 * typing stops, while online.
 *
 * @param {EditedRecipe} recipe the recipe being edited
 * @param {Function} resolveIngredient the cook's own ingredient of a name, else a new one
 * @param {Function} edit applies a change to the recipe being edited
 * @return {object} whether a row waits to be read, and a way to read them all at once, which resolves to the
 *     recipe with them read
 */
export const useIngredientReading = (
    recipe: EditedRecipe,
    resolveIngredient: (name: string) => Ingredient,
    edit: (change: (recipe: EditedRecipe) => EditedRecipe) => void,
) => {
  const [readLines] = useReadIngredientLinesMutation();
  const online = useIsOnline();
  const unread = unreadIngredientTexts(recipe);

  const read = async (texts: string[]) => {
    const ingredients = await readLines(texts).unwrap();
    const lines = new Map(texts.map((text, at): [string, IngredientUse | null] => {
      const line = ingredients[at];
      return [text, line &&
        {ingredient: resolveIngredient(line.ingredient.name), amount: line.amount, unit: line.unit, note: line.note}];
    }));
    edit((current) => withIngredientsRead(current, lines));
    return lines;
  };
  const latestRead = useRef(read);
  latestRead.current = read;

  useEffect(() => {
    if (!online || unread.length === 0) {
      return;
    }
    // A failed read waits for the next change; saving reads again and reports it
    const timer = setTimeout(() => latestRead.current(unread).catch(() => undefined), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // Keyed on the texts' content, not the array, which is new on every render
  }, [unread.join('\n'), online]);

  return {
    unread: unread.length > 0,
    readAll: async (): Promise<EditedRecipe> =>
      unread.length === 0 ? recipe : withIngredientsRead(recipe, await read(unread)),
  };
};
