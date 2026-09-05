/**
 * Handing a read-but-unsaved recipe to the wizard, out of band: a recipe passed as a
 * navigation param lands in the address bar as `draftRecipe=%5Bobject%20Object%5D`.
 */

import {Recipe} from '../dao/RestAPI';

let waiting: Recipe | undefined;

export const holdDraft = (recipe: Recipe): void => {
  waiting = recipe;
};

// Takes the draft, if one is waiting. Leaves none behind, so a reload does not re-open it.
export const takeDraft = (): Recipe | undefined => {
  const draft = waiting;
  waiting = undefined;
  return draft;
};
