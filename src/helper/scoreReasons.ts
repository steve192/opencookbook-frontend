import {TFunction} from 'i18next';
import {ScoreReason} from '../dao/RestAPI';

/**
 * Why a recipe was chosen, for suggestions and planned weeks alike. A term that raised a recipe is a
 * reason, one that lowered it a concern. `jitter` is neither: it only breaks ties.
 */

/** Weightiest first, so the strongest reason reads first. */
const REASON_KEYS: Record<string, string> = {
  ingredientCoverage: 'reasons.ingredientCoverage',
  pantry: 'reasons.pantry',
  recipeCoverage: 'reasons.recipeCoverage',
  mealTypeFit: 'reasons.mealTypeFit',
  kcalFit: 'reasons.kcalFit',
  macroFit: 'reasons.macroFit',
};

/** Most surprising first. */
const CONCERN_KEYS: Record<string, string> = {
  cooldown: 'reasons.cooldown',
  reroll: 'reasons.reroll',
  meatBudget: 'reasons.meatBudget',
  effortFit: 'reasons.effortFit',
  variety: 'reasons.variety',
  pantry: 'reasons.pantryUsedUp',
};

const inOrderOf = (keys: Record<string, string>) => (left: ScoreReason, right: ScoreReason) =>
  Object.keys(keys).indexOf(left.term) - Object.keys(keys).indexOf(right.term);

/**
 * @param {ScoreReason[]} reasons every term the server scored
 * @return {ScoreReason[]} the terms that raised the recipe and can be named, in reading order
 */
export const shownReasons = (reasons: ScoreReason[]): ScoreReason[] =>
  reasons.filter((reason) => reason.value > 0 && reason.term in REASON_KEYS).sort(inOrderOf(REASON_KEYS));

/**
 * @param {ScoreReason[]} reasons every term the server scored
 * @return {ScoreReason[]} the terms that held the recipe back and can be named, in reading order
 */
export const concerns = (reasons: ScoreReason[]): ScoreReason[] =>
  reasons.filter((reason) => reason.value < 0 && reason.term in CONCERN_KEYS).sort(inOrderOf(CONCERN_KEYS));

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {ScoreReason} reason a term from {@link shownReasons} or {@link concerns}
 * @return {string} what to call it
 */
export const scoreReasonLabel = (t: TFunction, reason: ScoreReason): string =>
  t(reason.value > 0 ? REASON_KEYS[reason.term] : CONCERN_KEYS[reason.term]);
