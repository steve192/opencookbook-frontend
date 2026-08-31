import {describe, expect, it} from 'vitest';
import {IngredientUse} from '../dao/RestAPI';
import {
  findIngredientsWithoutStep,
  ingredientNameForms,
  matchIngredientsInStep,
  splitStepForHighlighting,
} from './ingredientMatching';

const use = (name: string): IngredientUse => ({ingredient: {name}, amount: null, unit: ''});

const usedNames = (step: string, names: string[]) => {
  const ingredients = names.map(use);
  return matchIngredientsInStep(step, ingredients)
      .usedIngredientIndexes.map((index) => names[index]);
};

const highlighted = (step: string, names: string[]) =>
  matchIngredientsInStep(step, names.map(use))
      .highlights.map((range) => step.slice(range.start, range.end));

describe('matchIngredientsInStep', () => {
  it('finds an ingredient named exactly', () => {
    expect(usedNames('Fry the onion.', ['Onion', 'Flour'])).toEqual(['Onion']);
  });

  it('ignores case and accents', () => {
    expect(usedNames('Das Püree einrühren.', ['puree'])).toEqual(['puree']);
  });

  // The everyday case in a German recipe: the list says Zwiebel, the step says Zwiebeln
  it('follows a word into its plural', () => {
    expect(usedNames('Die Zwiebeln anbraten.', ['Zwiebel'])).toEqual(['Zwiebel']);
  });

  it('follows a plural in the list back to the singular in the step', () => {
    expect(usedNames('Die Zwiebel anbraten.', ['Zwiebeln'])).toEqual(['Zwiebeln']);
  });

  // A compound is a different thing, not a longer spelling of the same thing
  it('keeps a compound word apart from its stem', () => {
    expect(usedNames('Salzkartoffeln kochen.', ['Salz'])).toEqual([]);
  });

  describe('compounds', () => {
    // The step writing shorthand for what the list spells out in full. Missing this left
    // the ingredient under "everything else", where it is easy to cook right past.
    it('finds an ingredient the step abbreviates', () => {
      expect(usedNames('Mit Curry abschmecken.', ['Currypulver'])).toEqual(['Currypulver']);
    });

    it('finds it however the ingredient continues', () => {
      expect(usedNames('Etwas Tomaten dazu.', ['Tomatenmark'])).toEqual(['Tomatenmark']);
      expect(usedNames('Zucker einrühren.', ['Zuckerrübensirup'])).toEqual(['Zuckerrübensirup']);
    });

    // A compound is a kind of its last part, so this holds in both directions
    it('finds an ingredient that is the head of a compound in the step', () => {
      expect(usedNames('Das Hackfleisch anbraten.', ['Fleisch'])).toEqual(['Fleisch']);
    });

    it('finds an ingredient whose compound the step shortens to its head', () => {
      expect(usedNames('Die Suppe salzen.', ['Zwiebelsuppe'])).toEqual(['Zwiebelsuppe']);
    });

    // Still not a match: the step names a dish, not the ingredient it starts with
    it('still keeps a longer compound in the step away from a short ingredient', () => {
      expect(usedNames('Salzkartoffeln kochen.', ['Salz'])).toEqual([]);
      expect(usedNames('Das Zuckerbrot schneiden.', ['Zucker'])).toEqual([]);
    });

    it('needs enough of the word to stand for the whole compound', () => {
      // "Ol" is too little of "Olivenoel" to be told apart from any other word in "ol"
      expect(usedNames('Etwas Öl erhitzen.', ['Olivenöl'])).toEqual([]);
    });

    it('highlights the shorthand the step actually used', () => {
      expect(highlighted('Mit Curry abschmecken.', ['Currypulver'])).toEqual(['Curry']);
    });
  });

  it('does not let a short name swallow an unrelated word', () => {
    expect(usedNames('Eine Prise dazugeben.', ['Ei'])).toEqual([]);
    expect(usedNames('Der ölige Rest bleibt.', ['Öl'])).toEqual([]);
  });

  it('still finds a short name spelled exactly', () => {
    expect(usedNames('Das Ei trennen.', ['Ei'])).toEqual(['Ei']);
  });

  // Endings rather than letter counts: all of these add two or three letters to "Ei" or
  // "Öl", and only the real inflections are the same word.
  describe('inflections of a very short name', () => {
    it('finds the plural', () => {
      expect(usedNames('Drei Eier trennen.', ['Ei'])).toEqual(['Ei']);
    });

    it('finds the dative plural', () => {
      expect(usedNames('Mit zwei Eiern verquirlen.', ['Ei'])).toEqual(['Ei']);
    });

    it('is not fooled by a word that merely starts the same way', () => {
      expect(usedNames('Eine Prise dazugeben.', ['Ei'])).toEqual([]);
      expect(usedNames('Der ölige Rest bleibt.', ['Öl'])).toEqual([]);
    });

    it('is not fooled by a word that merely ends the same way', () => {
      expect(usedNames('Drei Löffel Brei dazu.', ['Ei'])).toEqual([]);
    });
  });

  it('separates words from punctuation', () => {
    expect(usedNames('Alles (Mehl, Zucker) mischen.', ['Mehl', 'Zucker'])).toEqual(['Mehl', 'Zucker']);
  });

  // The old splitter replaced only the first comma, so anything after the second was lost
  it('separates every occurrence of a separator, not just the first', () => {
    expect(usedNames('Mehl, Zucker, Butter, Salz', ['Butter', 'Salz'])).toEqual(['Butter', 'Salz']);
  });

  describe('ingredients of more than one word', () => {
    it('needs all of the carrying words', () => {
      expect(usedNames('Add the oil.', ['Olive oil'])).toEqual([]);
      expect(usedNames('Add the olive oil.', ['Olive oil'])).toEqual(['Olive oil']);
    });

    it('does not need the filler words', () => {
      expect(usedNames('Pfeffer und Salz dazu.', ['Salz und Pfeffer'])).toEqual(['Salz und Pfeffer']);
    });

    it('matches the words in any order', () => {
      expect(usedNames('Zuerst das Öl, dann die Oliven.', ['Oliven Öl'])).toEqual(['Oliven Öl']);
    });
  });

  it('finds several ingredients in one step', () => {
    expect(usedNames('Mehl mit Zucker und Butter verkneten.', ['Mehl', 'Zucker', 'Butter', 'Hefe']))
        .toEqual(['Mehl', 'Zucker', 'Butter']);
  });

  it('reports nothing for a step that names no ingredient', () => {
    expect(usedNames('Den Ofen vorheizen.', ['Mehl', 'Zucker'])).toEqual([]);
  });

  it('skips an ingredient without a name', () => {
    expect(usedNames('Mehl dazu.', [''])).toEqual([]);
  });

  describe('highlights', () => {
    // The whole point of one pass: what is highlighted is what was matched
    it('marks exactly the words that named an ingredient', () => {
      expect(highlighted('Mehl mit Zucker verkneten.', ['Mehl', 'Zucker'])).toEqual(['Mehl', 'Zucker']);
    });

    it('marks the inflected spelling that appears in the step', () => {
      expect(highlighted('Die Zwiebeln anbraten.', ['Zwiebel'])).toEqual(['Zwiebeln']);
    });

    it('marks every word of a multi word ingredient', () => {
      expect(highlighted('Add the olive oil now.', ['Olive oil'])).toEqual(['olive', 'oil']);
    });

    it('marks a word once even when two ingredients share it', () => {
      expect(highlighted('Zwiebeln anbraten.', ['Zwiebel', 'Zwiebeln'])).toEqual(['Zwiebeln']);
    });

    it('marks nothing when nothing matched', () => {
      expect(highlighted('Den Ofen vorheizen.', ['Mehl'])).toEqual([]);
    });

    it('returns ranges in reading order', () => {
      const step = 'Zucker, dann Mehl.';
      expect(highlighted(step, ['Mehl', 'Zucker'])).toEqual(['Zucker', 'Mehl']);
    });
  });
});

describe('splitStepForHighlighting', () => {
  const parts = (step: string, names: string[]) =>
    splitStepForHighlighting(step, matchIngredientsInStep(step, names.map(use)).highlights);

  it('keeps the whole text, in order', () => {
    const step = 'Mehl mit Zucker verkneten.';
    expect(parts(step, ['Mehl', 'Zucker']).map((part) => part.text).join('')).toBe(step);
  });

  it('marks only the ingredient parts', () => {
    expect(parts('Mehl mit Zucker verkneten.', ['Mehl', 'Zucker'])).toEqual([
      {text: 'Mehl', highlighted: true},
      {text: ' mit ', highlighted: false},
      {text: 'Zucker', highlighted: true},
      {text: ' verkneten.', highlighted: false},
    ]);
  });

  it('returns the step untouched when nothing matched', () => {
    expect(parts('Den Ofen vorheizen.', ['Mehl'])).toEqual([
      {text: 'Den Ofen vorheizen.', highlighted: false},
    ]);
  });

  it('handles a step that is nothing but an ingredient', () => {
    expect(parts('Mehl', ['Mehl'])).toEqual([{text: 'Mehl', highlighted: true}]);
  });

  it('handles an empty step', () => {
    expect(parts('', ['Mehl'])).toEqual([]);
  });
});

describe('findIngredientsWithoutStep', () => {
  const namesWithoutStep = (steps: string[], names: string[]) =>
    findIngredientsWithoutStep(steps, names.map(use)).map((index) => names[index]);

  it('reports an ingredient no step mentions', () => {
    expect(namesWithoutStep(['Mehl abwiegen.', 'Zucker dazu.'], ['Mehl', 'Zucker', 'Hefe']))
        .toEqual(['Hefe']);
  });

  it('reports nothing when every ingredient is used somewhere', () => {
    expect(namesWithoutStep(['Mehl abwiegen.', 'Zucker dazu.'], ['Mehl', 'Zucker'])).toEqual([]);
  });

  // Used late is not the same as never used, and only the second is worth warning about
  it('does not report an ingredient that only a later step uses', () => {
    expect(namesWithoutStep(['Mehl abwiegen.', 'Zum Schluss die Hefe.'], ['Mehl', 'Hefe']))
        .toEqual([]);
  });

  it('keeps the order of the ingredient list', () => {
    expect(namesWithoutStep(['Zucker dazu.'], ['Hefe', 'Zucker', 'Salz'])).toEqual(['Hefe', 'Salz']);
  });

  it('reports every ingredient for a recipe without steps', () => {
    expect(namesWithoutStep([], ['Mehl', 'Zucker'])).toEqual(['Mehl', 'Zucker']);
  });

  it('reports nothing for a recipe without ingredients', () => {
    expect(namesWithoutStep(['Mehl abwiegen.'], [])).toEqual([]);
  });
});

// Ingredient names carry notation for the forms a word can take. Read as prose, "Ei(er)"
// looks like a thing called "Ei er" that needs both words present, which no step says.
describe('ingredientNameForms', () => {
  it('reads an attached ending as both spellings', () => {
    expect(ingredientNameForms('Ei(er)')).toEqual(['Ei', 'Eier']);
    expect(ingredientNameForms('Karott(en)')).toEqual(['Karott', 'Karotten']);
  });

  it('keeps the rest of the name around an attached ending', () => {
    expect(ingredientNameForms('Rote Zwiebel(n) fein')).toEqual(['Rote Zwiebel fein', 'Rote Zwiebeln fein']);
  });

  it('drops a description in brackets', () => {
    expect(ingredientNameForms('Pfeffer (gemahlen)')).toEqual(['Pfeffer']);
  });

  it('reads a short tail after a slash as an ending', () => {
    expect(ingredientNameForms('Zehe/n')).toEqual(['Zehe', 'Zehen']);
  });

  it('reads a long tail after a slash as another name', () => {
    expect(ingredientNameForms('Butter/Margarine')).toEqual(['Butter', 'Margarine']);
  });

  it('leaves an ordinary name alone', () => {
    expect(ingredientNameForms('Gemahlener Pfeffer')).toEqual(['Gemahlener Pfeffer']);
  });

  it('has no forms for an empty name', () => {
    expect(ingredientNameForms('')).toEqual([]);
  });
});

describe('ingredients written with notation', () => {
  it('finds both spellings of an attached ending', () => {
    expect(usedNames('Die Eier trennen.', ['Ei(er)'])).toEqual(['Ei(er)']);
    expect(usedNames('Das Ei trennen.', ['Ei(er)'])).toEqual(['Ei(er)']);
    expect(usedNames('Die Karotten schälen.', ['Karott(en)'])).toEqual(['Karott(en)']);
    expect(usedNames('Die Karotte schälen.', ['Karott(en)'])).toEqual(['Karott(en)']);
  });

  it('does not need the description in brackets to appear', () => {
    expect(usedNames('Pfeffer dazugeben.', ['Pfeffer (gemahlen)'])).toEqual(['Pfeffer (gemahlen)']);
  });

  it('finds either of two names joined by a slash', () => {
    expect(usedNames('Butter schmelzen.', ['Butter/Margarine'])).toEqual(['Butter/Margarine']);
    expect(usedNames('Margarine schmelzen.', ['Butter/Margarine'])).toEqual(['Butter/Margarine']);
  });

  it('highlights the spelling the step used', () => {
    expect(highlighted('Die Eier trennen.', ['Ei(er)'])).toEqual(['Eier']);
    expect(highlighted('Das Ei trennen.', ['Ei(er)'])).toEqual(['Ei']);
  });

  // The notation must not become a way in for anything that starts the same way
  it('is still not fooled by an unrelated word', () => {
    expect(usedNames('Eine Prise dazugeben.', ['Ei(er)'])).toEqual([]);
  });
});
