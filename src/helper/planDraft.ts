import {TFunction} from 'i18next';
import {PlanDraft, PlanSlot, RerollReason} from '../dao/RestAPI';
import {inDayOrder} from './mealTypes';

/** Reading a proposed week: by day, and what each of its meals is. */

export interface DraftDay {
  /** As a day key. */
  date: string;
  /** In the order of a day. */
  slots: PlanSlot[];
}

/**
 * @param {PlanDraft} draft the proposed week
 * @return {DraftDay[]} its days in order, each with its meals in the order of a day
 */
export const draftDays = (draft: PlanDraft): DraftDay[] => {
  const dates = [...new Set(draft.slots.map((slot) => slot.date))]
      .sort((left, right) => left.localeCompare(right));
  return dates.map((date) => ({
    date,
    slots: draft.slots
        .filter((slot) => slot.date === date)
        .sort((left, right) => inDayOrder(left.mealType, right.mealType)),
  }));
};

/**
 * @param {PlanDraft} draft the proposed week
 * @param {PlanSlot} leftover a leftover meal
 * @return {PlanSlot | undefined} the meal where it is cooked
 */
export const leftoverSource = (draft: PlanDraft, leftover: PlanSlot): PlanSlot | undefined =>
  draft.slots.find((slot) => slot.id === leftover.leftoverOf);

/**
 * A meal to cook that the cookbook had nothing for. The draft says so rather than inventing one.
 *
 * @param {PlanSlot} slot a meal of the week
 * @return {boolean} whether it still needs a recipe
 */
export const isUnfilled = (slot: PlanSlot): boolean => slot.kind === 'COOKED' && slot.recipe === null;

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {PlanDraft} draft the proposed week
 * @return {string} how much of the week is cooked, and how much is left to the cook
 */
export const draftSummary = (t: TFunction, draft: PlanDraft): string => t('screens.planning.summary', {
  recipes: draft.slots.filter((slot) => slot.kind === 'COOKED' && slot.recipe !== null).length,
  leftovers: draft.slots.filter((slot) => slot.kind === 'LEFTOVER').length,
  gaps: draft.slots.filter((slot) => slot.kind === 'GAP').length,
});

/** The reasons offered when passing over a recipe, most common first. */
export const REROLL_REASONS: RerollReason[] = ['HAD_RECENTLY', 'TOO_MUCH_WORK', 'MISSING_INGREDIENTS', 'NOT_A_FULL_MEAL'];

const REROLL_REASON_LABEL_KEYS = {
  HAD_RECENTLY: 'screens.planning.rerollHadRecently',
  TOO_MUCH_WORK: 'screens.planning.rerollTooMuchWork',
  MISSING_INGREDIENTS: 'screens.planning.rerollMissingIngredients',
  NOT_A_FULL_MEAL: 'screens.planning.rerollNotAFullMeal',
} as const;

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {RerollReason} reason why a recipe is passed over
 * @return {string} what to call it
 */
export const rerollReasonLabel = (t: TFunction, reason: RerollReason): string => t(REROLL_REASON_LABEL_KEYS[reason]);
