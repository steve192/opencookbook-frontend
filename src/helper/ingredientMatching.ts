import {IngredientUse} from '../dao/RestAPI';

/** A stretch of the step text that named an ingredient. */
export interface TextRange {
  start: number;
  end: number;
}

export interface StepIngredientMatch {
  /** Indexes into the ingredient list of everything this step uses */
  usedIngredientIndexes: number[];
  /** Where in the step text those ingredients were named, in reading order */
  highlights: TextRange[];
}

interface Token {
  text: string;
  start: number;
  end: number;
}

/**
 * Words that would otherwise force a match on their own. An ingredient called
 * "Salz und Pfeffer" must not need the word "und" to appear in the step.
 */
const STOPWORDS = new Set([
  'und', 'oder', 'mit', 'ohne', 'zum', 'zur', 'der', 'die', 'das', 'den', 'dem', 'ein', 'eine',
  'and', 'or', 'with', 'without', 'the', 'for', 'of', 'to', 'a', 'an',
]);

/**
 * What a word may gain and still be the same word: German case and plural endings, plus the
 * English plural. Testing the ending rather than counting letters is what tells an inflection
 * from a different word - "Ei" grows into "Eier" but not into "eine", and "Öl" does not grow
 * into "ölig", even though all three add two or three letters.
 */
const INFLECTION_ENDINGS = new Set(['e', 'n', 'en', 'er', 'ern', 'es', 'em', 's', 'nen']);

/** A word this short carries too little to be matched as anything but itself. */
const MIN_STEM_LENGTH = 2;

/** How much of a compound a word has to be before it can stand for the whole of it. */
const MIN_COMPOUND_PART = 4;

/**
 * Lowercases and strips accents, so "Püree" and "Puree" are the same word.
 *
 * @param {string} value text to normalise
 * @return {string} the comparable form of it
 */
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Splits text into words, keeping where each one sat so it can be highlighted later.
 *
 * @param {string} text text to split
 * @return {Token[]} the words of the text with their positions
 */
const tokenize = (text: string): Token[] => {
  const tokens: Token[] = [];
  // Letters and digits make a word; everything else (punctuation, brackets, dashes) separates
  const wordPattern = /[\p{L}\p{N}]+/gu;
  let match = wordPattern.exec(text);
  while (match !== null) {
    tokens.push({text: normalize(match[0]), start: match.index, end: match.index + match[0].length});
    match = wordPattern.exec(text);
  }
  return tokens;
};

/**
 * Whether a word in the step names a given word of an ingredient.
 *
 * German builds compounds by gluing words together, and which side the glue is on carries
 * meaning, so this is deliberately not symmetric:
 *
 * - The step naming part of a longer ingredient is the cook writing shorthand. "Curry" in
 *   the step is the "Currypulver" in the list, so a step word that begins an ingredient
 *   counts.
 * - The step naming something longer that merely begins with an ingredient is a different
 *   thing. "Salzkartoffeln" is a dish, not the "Salz" in the list, so that does not count.
 * - The head of a German compound is its last part, and a compound is a kind of its head:
 *   "Hackfleisch" is a kind of "Fleisch". Ending with the other word therefore counts in
 *   either direction.
 *
 * @param {string} stepWord a normalised word from the preparation step
 * @param {string} ingredientWord a normalised word from an ingredient name
 * @return {boolean} true when the step word names that part of the ingredient
 */
const wordsMatch = (stepWord: string, ingredientWord: string): boolean => {
  if (stepWord === ingredientWord) {
    return true;
  }

  const [shorter, longer] = stepWord.length < ingredientWord.length ?
    [stepWord, ingredientWord] :
    [ingredientWord, stepWord];

  // Declined or pluralised, in either direction: Zwiebel and Zwiebeln, Ei and Eiern
  if (shorter.length >= MIN_STEM_LENGTH &&
      longer.startsWith(shorter) &&
      INFLECTION_ENDINGS.has(longer.slice(shorter.length))) {
    return true;
  }

  // The step abbreviating a longer ingredient: Curry for Currypulver
  if (stepWord.length >= MIN_COMPOUND_PART && ingredientWord.startsWith(stepWord)) {
    return true;
  }

  // A compound is a kind of its last part: Hackfleisch is Fleisch, either way round
  return shorter.length >= MIN_COMPOUND_PART && longer.endsWith(shorter);
};

/** A slash tail this short is a plural ending rather than another name: "Zehe/n". */
const MAX_SUFFIX_AFTER_SLASH = 3;

/**
 * The ways an ingredient may be written, from a name that carries notation.
 *
 * Ingredient names are not plain prose. They are written with a shorthand for the forms a
 * word can take, and reading that literally is what made them impossible to find:
 *
 * - "Ei(er)" is Ei or Eier, not a thing called "Ei er".
 * - "Pfeffer (gemahlen)" is pepper, described. A step saying "Pfeffer" is naming it.
 * - "Butter/Margarine" is either of two things, not one thing needing both words.
 * - "Zehe/n" is Zehe or Zehen, because the tail is only an ending.
 *
 * The ingredient counts as used when any one of the forms is found.
 *
 * @param {string} name the ingredient name as it is written down
 * @return {string[]} every spelling that should count, without duplicates
 */
export const ingredientNameForms = (name: string): string[] => {
  // " (gemahlen)" describes the ingredient rather than spelling it
  const withoutAside = name.replace(/\s+\([^)]*\)/g, '').trim();

  // "Ei(er)" attaches straight to the word, and stands for both ways of writing it
  const attachedEnding = /^(.*?)([\p{L}\p{N}]+)\(([^)]+)\)(.*)$/u.exec(withoutAside);
  const spellings = attachedEnding ?
    [
      `${attachedEnding[1]}${attachedEnding[2]}${attachedEnding[4]}`,
      `${attachedEnding[1]}${attachedEnding[2]}${attachedEnding[3]}${attachedEnding[4]}`,
    ] :
    [withoutAside];

  const forms = spellings.flatMap((spelling) => {
    const parts = spelling.split('/');
    if (parts.length === 1) {
      return [spelling];
    }
    // A short tail continues the first part, a long one is a name of its own
    return parts.slice(1).reduce(
        (alternatives: string[], part) => alternatives.concat(
            part.trim().length <= MAX_SUFFIX_AFTER_SLASH ? parts[0] + part : part),
        [parts[0]],
    );
  });

  return [...new Set(forms.map((form) => form.trim()).filter((form) => form.length > 0))];
};

/**
 * The words of an ingredient name that have to appear for it to count as used.
 *
 * @param {string} name ingredient name
 * @return {string[]} the words that carry the meaning
 */
const significantWords = (name: string): string[] => {
  const words = tokenize(name).map((token) => token.text);
  const carrying = words.filter((word) => word.length >= 3 && !STOPWORDS.has(word));
  // An ingredient of nothing but short words ("Öl", "Ei") still has to match on them
  return carrying.length > 0 ? carrying : words;
};

/**
 * Works out which ingredients a preparation step uses, and where it names them.
 *
 * One pass produces both answers so they cannot disagree. They used to be computed by two
 * different fuzzy searches running in opposite directions - one asking "is this ingredient
 * somewhere in the step", the other "is this word an ingredient" - which is why the words
 * highlighted in a step and the ingredients listed under it did not line up.
 *
 * A multi word ingredient has to have all of its carrying words in the step, so "olive oil"
 * is not found by the word "oil" belonging to another ingredient.
 *
 * @param {string} step the preparation step text
 * @param {IngredientUse[]} ingredients the ingredients of the whole recipe
 * @return {StepIngredientMatch} the ingredients used and the ranges naming them
 */
export const matchIngredientsInStep = (
    step: string,
    ingredients: IngredientUse[],
): StepIngredientMatch => {
  const stepTokens = tokenize(step);
  const usedIngredientIndexes: number[] = [];
  const highlightedTokens = new Set<Token>();

  ingredients.forEach((ingredient, index) => {
    let found = false;

    // Any one of the ways the ingredient may be written is enough
    ingredientNameForms(ingredient.ingredient.name).forEach((form) => {
      const words = significantWords(form);
      if (words.length === 0) {
        return;
      }

      // Every carrying word of that form has to appear somewhere in the step
      const matchesPerWord = words.map((word) =>
        stepTokens.filter((token) => wordsMatch(token.text, word)));
      if (matchesPerWord.some((matches) => matches.length === 0)) {
        return;
      }

      found = true;
      matchesPerWord.forEach((matches) => matches.forEach((token) => highlightedTokens.add(token)));
    });

    if (found) {
      usedIngredientIndexes.push(index);
    }
  });

  const highlights = stepTokens
      .filter((token) => highlightedTokens.has(token))
      .map((token) => ({start: token.start, end: token.end}));

  return {usedIngredientIndexes, highlights};
};

/**
 * Splits the text of a step into the parts that name an ingredient and the parts that
 * do not, so it can be rendered as one run of text with highlights inside it.
 *
 * @param {string} step the preparation step text
 * @param {TextRange[]} highlights ranges naming an ingredient, in reading order
 * @return {Array<{text: string, highlighted: boolean}>} the step in order, nothing lost
 */
export const splitStepForHighlighting = (
    step: string,
    highlights: TextRange[],
): Array<{text: string, highlighted: boolean}> => {
  const parts: Array<{text: string, highlighted: boolean}> = [];
  let position = 0;

  highlights.forEach((range) => {
    if (range.start > position) {
      parts.push({text: step.slice(position, range.start), highlighted: false});
    }
    parts.push({text: step.slice(range.start, range.end), highlighted: true});
    position = range.end;
  });

  if (position < step.length) {
    parts.push({text: step.slice(position), highlighted: false});
  }
  return parts;
};

/**
 * The ingredients that no step of the recipe mentions.
 *
 * Matching a step to its ingredients can never be perfect, and an ingredient that no step
 * claims is either a miss or genuinely never written down ("salt to taste"). Either way it
 * is the one most likely to be forgotten, so it is worth separating from the ingredients
 * that simply belong to a different step.
 *
 * @param {string[]} steps every preparation step of the recipe
 * @param {IngredientUse[]} ingredients the ingredients of the recipe
 * @return {number[]} indexes of the ingredients no step mentions, in list order
 */
export const findIngredientsWithoutStep = (
    steps: string[],
    ingredients: IngredientUse[],
): number[] => {
  const mentioned = new Set<number>();
  steps.forEach((step) => {
    matchIngredientsInStep(step, ingredients).usedIngredientIndexes
        .forEach((index) => mentioned.add(index));
  });
  return ingredients.map((unused, index) => index).filter((index) => !mentioned.has(index));
};
