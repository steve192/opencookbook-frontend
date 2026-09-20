import {describe, expect, it} from 'vitest';
import {parseOptionalNumber, toggledChoice, toggledIn, typedNumber, withToggled} from './choices';

describe('parseOptionalNumber', () => {
  it('reads a number', () => {
    expect(parseOptionalNumber('35')).toBe(35);
  });

  it('clears the field when the text is not a number', () => {
    expect(parseOptionalNumber('')).toBeUndefined();
    expect(parseOptionalNumber('abc')).toBeUndefined();
  });
});

describe('typedNumber', () => {
  it('clears the answer rather than leaving it undefined', () => {
    expect(typedNumber('4')).toBe(4);
    expect(typedNumber('')).toBeNull();
  });
});

describe('toggledChoice', () => {
  it('chooses a value and clears it on a second tap', () => {
    expect(toggledChoice(null, 'VEGAN')).toBe('VEGAN');
    expect(toggledChoice('VEGAN', 'VEGAN')).toBeNull();
  });
});

describe('toggledIn', () => {
  it('adds a value and removes it again', () => {
    expect(toggledIn([1], 2)).toEqual([1, 2]);
    expect(toggledIn([1, 2], 1)).toEqual([2]);
  });
});

describe('withToggled', () => {
  it('sets one field, clears it when tapped again, and leaves the others', () => {
    const answers = {diet: null as string | null, macroStyle: 'LOW_CARB'};

    expect(withToggled(answers, 'diet', 'VEGAN')).toEqual({diet: 'VEGAN', macroStyle: 'LOW_CARB'});
    expect(withToggled(answers, 'macroStyle', 'LOW_CARB').macroStyle).toBeNull();
  });
});
