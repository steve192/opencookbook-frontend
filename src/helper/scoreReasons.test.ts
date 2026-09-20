import {describe, expect, it} from 'vitest';
import {concerns, shownReasons} from './scoreReasons';

describe('shownReasons', () => {
  it('leaves out terms that contributed nothing', () => {
    const shown = shownReasons([{term: 'ingredientCoverage', value: 1}, {term: 'mealTypeFit', value: 0}]);

    expect(shown.map((reason) => reason.term)).toEqual(['ingredientCoverage']);
  });

  // It only breaks ties between equally good recipes, so reading it out would be a lie
  it('never shows the jitter that broke a tie', () => {
    expect(shownReasons([{term: 'jitter', value: 0.04}])).toEqual([]);
  });

  it('puts the weightiest reason first, whatever order the server sent', () => {
    const shown = shownReasons([
      {term: 'macroFit', value: 0.3},
      {term: 'ingredientCoverage', value: 1},
      {term: 'recipeCoverage', value: 0.2},
    ]);

    expect(shown.map((reason) => reason.term)).toEqual(['ingredientCoverage', 'recipeCoverage', 'macroFit']);
  });

  it('ignores a term it has no label for rather than showing a blank chip', () => {
    expect(shownReasons([{term: 'somethingNew', value: 1}])).toEqual([]);
  });
});

describe('concerns', () => {
  it('names what held a recipe back, most surprising first', () => {
    const named = concerns([
      {term: 'effortFit', value: -0.3},
      {term: 'cooldown', value: -2},
      {term: 'kcalFit', value: 0.4},
    ]);
    expect(named.map((reason) => reason.term)).toEqual(['cooldown', 'effortFit']);
  });

  it('reads the pantry both ways: using stock up is a reason, buying more of it a concern', () => {
    expect(shownReasons([{term: 'pantry', value: 0.5}])).toHaveLength(1);
    expect(concerns([{term: 'pantry', value: -0.3}])).toHaveLength(1);
  });

  it('never names the jitter', () => {
    expect(concerns([{term: 'jitter', value: -0.01}])).toEqual([]);
  });
});
