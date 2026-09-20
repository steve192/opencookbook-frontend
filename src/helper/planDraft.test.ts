import {TFunction} from 'i18next';
import {describe, expect, it} from 'vitest';
import {PlanDraft, PlanSlot} from '../dao/RestAPI';
import {REROLL_REASONS, draftDays, isUnfilled, leftoverSource, rerollReasonLabel} from './planDraft';

const slot = (id: number, date: string, mealType: PlanSlot['mealType'], kind: PlanSlot['kind'] = 'COOKED',
    leftoverOf: number | null = null): PlanSlot => ({
  id, date, mealType, kind, leftoverOf,
  recipe: kind === 'GAP' ? null : {id: id, title: 'Rezept ' + id, images: []} as unknown as PlanSlot['recipe'],
  servings: 2, locked: false, reasons: [],
});

const draft = (slots: PlanSlot[]): PlanDraft =>
  ({id: 1, profileId: 1, startDate: '2026-09-21', days: 7, status: 'DRAFT', slots});

describe('draftDays', () => {
  it('reads a week day by day, each day in the order of its meals', () => {
    const days = draftDays(draft([
      slot(3, '2026-09-22', 'DINNER'),
      slot(1, '2026-09-21', 'DINNER'),
      slot(2, '2026-09-21', 'LUNCH', 'GAP'),
    ]));

    expect(days.map((day) => day.date)).toEqual(['2026-09-21', '2026-09-22']);
    expect(days[0].slots.map((meal) => meal.mealType)).toEqual(['LUNCH', 'DINNER']);
  });
});

describe('leftoverSource', () => {
  it('finds the meal a leftover is cooked at', () => {
    const cooked = slot(1, '2026-09-21', 'DINNER');
    const leftover = slot(2, '2026-09-22', 'LUNCH', 'LEFTOVER', 1);

    expect(leftoverSource(draft([cooked, leftover]), leftover)).toBe(cooked);
  });
});

describe('isUnfilled', () => {
  it('tells a meal the cookbook had nothing for from a gap left to the cook', () => {
    expect(isUnfilled({...slot(1, '2026-09-21', 'DINNER'), recipe: null})).toBe(true);
    expect(isUnfilled(slot(2, '2026-09-21', 'LUNCH', 'GAP'))).toBe(false);
  });
});

describe('rerollReasonLabel', () => {
  const t = ((key: string) => key) as unknown as TFunction;

  it('names every reason offered', () => {
    expect(REROLL_REASONS.map((reason) => rerollReasonLabel(t, reason))).toEqual([
      'screens.planning.rerollHadRecently',
      'screens.planning.rerollTooMuchWork',
      'screens.planning.rerollMissingIngredients',
      'screens.planning.rerollNotAFullMeal',
    ]);
  });
});
