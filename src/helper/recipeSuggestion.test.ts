import {TFunction} from 'i18next';
import {describe, expect, it} from 'vitest';
import {withToggled} from './choices';
import {
  answersSummary,
  emptySuggestionRequest,
  forNewDraw,
  hasAnswers,
  initialSuggestionRequest,
  moreFilterCount,
  offersMode,
  withIngredientToggled,
  withMealTypeWanted,
  usesHouseholdRecipes,
  withHouseholdRecipes,
  withMode,
  withTargetKcal,
} from './recipeSuggestion';

describe('emptySuggestionRequest', () => {
  it('asks for nothing, which is a valid surprise me', () => {
    const request = emptySuggestionRequest();

    expect(request.mode).toBe('ANY_RANKED');
    expect(request.ingredientIds).toEqual([]);
    expect(hasAnswers(request)).toBe(false);
  });
});

describe('hasAnswers', () => {
  it('notices each kind of answer', () => {
    expect(hasAnswers(withIngredientToggled(emptySuggestionRequest(), 1))).toBe(true);
    expect(hasAnswers(withMealTypeWanted(emptySuggestionRequest(), 'DINNER'))).toBe(true);
    expect(hasAnswers(withToggled(emptySuggestionRequest(), 'diet', 'VEGAN'))).toBe(true);
    expect(hasAnswers(withToggled(emptySuggestionRequest(), 'maxTotalTimeMinutes', 30))).toBe(true);
    expect(hasAnswers(withToggled(emptySuggestionRequest(), 'macroStyle', 'LOW_CARB'))).toBe(true);
  });

  // Picking the mode narrows nothing on its own: it only says how ingredients are meant
  it('does not count the mode as an answer', () => {
    expect(hasAnswers(withMode(emptySuggestionRequest(), 'MUST_CONTAIN'))).toBe(false);
  });

  it('does not count a balanced macro style, which asks for nothing', () => {
    expect(hasAnswers(withToggled(emptySuggestionRequest(), 'macroStyle', 'BALANCED'))).toBe(false);
  });
});

describe('answering the wizard', () => {
  it('adds and removes an ingredient', () => {
    const withOne = withIngredientToggled(emptySuggestionRequest(), 7);

    expect(withOne.ingredientIds).toEqual([7]);
    expect(withIngredientToggled(withOne, 7).ingredientIds).toEqual([]);
  });

  it('clears a diet when the chosen one is tapped again', () => {
    const vegan = withToggled(emptySuggestionRequest(), 'diet', 'VEGAN');

    expect(vegan.diet).toBe('VEGAN');
    expect(withToggled(vegan, 'diet', 'VEGAN').diet).toBeNull();
    expect(withToggled(vegan, 'diet', 'MEAT').diet).toBe('MEAT');
  });

  it('clears a macro style when the chosen one is tapped again', () => {
    const lowCarb = withToggled(emptySuggestionRequest(), 'macroStyle', 'LOW_CARB');

    expect(withToggled(lowCarb, 'macroStyle', 'LOW_CARB').macroStyle).toBeNull();
  });

  it('clears a time limit when the chosen one is tapped again', () => {
    const quick = withToggled(emptySuggestionRequest(), 'maxTotalTimeMinutes', 30);

    expect(quick.maxTotalTimeMinutes).toBe(30);
    expect(withToggled(quick, 'maxTotalTimeMinutes', 30).maxTotalTimeMinutes).toBeNull();
    expect(withToggled(quick, 'maxTotalTimeMinutes', 45).maxTotalTimeMinutes).toBe(45);
  });

  it('clears the calorie target when what was typed is not a number', () => {
    const targeted = withTargetKcal(emptySuggestionRequest(), '600');

    expect(targeted.targetKcalPerServing).toBe(600);
    expect(withTargetKcal(targeted, '').targetKcalPerServing).toBeNull();
  });
});

describe('initialSuggestionRequest', () => {
  it('asks for the meal of the hour', () => {
    expect(initialSuggestionRequest(19).mealTypes).toEqual(['DINNER']);
  });
});

describe('moreFilterCount', () => {
  it('counts diet, calories and a style other than balanced', () => {
    const request = withTargetKcal(withToggled(emptySuggestionRequest(), 'diet', 'VEGAN'), '500');

    expect(moreFilterCount(emptySuggestionRequest())).toBe(0);
    expect(moreFilterCount(withToggled(emptySuggestionRequest(), 'macroStyle', 'BALANCED'))).toBe(0);
    expect(moreFilterCount(request)).toBe(2);
  });
});

describe('offersMode', () => {
  // With a single ingredient "use what you can" and "must contain all" return the same recipes
  it('offers the choice only from two ingredients on', () => {
    const one = withIngredientToggled(emptySuggestionRequest(), 1);

    expect(offersMode(one)).toBe(false);
    expect(offersMode(withIngredientToggled(one, 2))).toBe(true);
  });
});

describe('answersSummary', () => {
  const t = ((key: string, options?: Record<string, unknown>) =>
    options ? `${key}:${Object.values(options).join()}` : key) as unknown as TFunction;

  it('lists the answers in one line', () => {
    const request = withToggled(withMealTypeWanted(emptySuggestionRequest(), 'DINNER'), 'maxTotalTimeMinutes', 30);

    expect(answersSummary(t, request, ['Feta'])).toBe('mealTypes.dinner · Feta · screens.suggestion.summaryTime:30');
  });

  it('says so when nothing was asked', () => {
    expect(answersSummary(t, emptySuggestionRequest(), [])).toBe('screens.suggestion.summaryAnything');
  });
});

describe('forNewDraw', () => {
  // Asking again is a deliberate new draw, not the same order handed back
  it('drops the seed that ordered the last results but keeps the answers', () => {
    const asked = {...withToggled(emptySuggestionRequest(), 'diet', 'VEGAN'), seed: 42};

    expect(forNewDraw(asked).seed).toBeNull();
    expect(forNewDraw(asked).diet).toBe('VEGAN');
  });
});

describe('household recipes in the pool', () => {
  it('leaves them out unless asked for', () => {
    expect(usesHouseholdRecipes(emptySuggestionRequest())).toBe(false);
    expect(usesHouseholdRecipes(withHouseholdRecipes(emptySuggestionRequest(), false))).toBe(false);
  });

  it('draws on them when asked for', () => {
    const request = withHouseholdRecipes(emptySuggestionRequest(), true);

    expect(usesHouseholdRecipes(request)).toBe(true);
    expect(request.includeHouseholdRecipes).toBe(true);
  });

  it('is only mentioned in the summary when it widened the pool', () => {
    const t = ((key: string) => key) as unknown as TFunction;

    expect(answersSummary(t, withHouseholdRecipes(emptySuggestionRequest(), true), []))
        .toBe('screens.suggestion.summaryWithHouseholds');
    expect(answersSummary(t, emptySuggestionRequest(), []))
        .toBe('screens.suggestion.summaryAnything');
  });
});
