import {Ingredient} from '../dao/RestAPI';

/** One of the cook's own ingredients, which unlike a catalogue name always has an id. */
export type OwnIngredient = Ingredient & {id: number};

/**
 * The ingredients endpoint also returns catalogue names for the recipe editor's autocomplete. Those
 * come with a null id and are nothing the server can match a recipe against.
 *
 * @param {Ingredient[]} all what the ingredients endpoint returned
 * @return {OwnIngredient[]} the cook's own ingredients among them
 */
export const ownIngredients = (all: Ingredient[]): OwnIngredient[] =>
  all.filter((ingredient): ingredient is OwnIngredient => ingredient.id != null);
