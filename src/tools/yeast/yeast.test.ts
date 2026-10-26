import {describe, expect, it} from 'vitest';
import {convertYeast, DEFAULT_YEAST_INPUTS, inPacks, parseYeastInputs, starterNeeded, unitsOf, yeastNeeded} from './yeast';

describe('convertYeast', () => {
  it('needs a third as much instant yeast as fresh', () => {
    expect(convertYeast(21, 'fresh', 'instant')).toBeCloseTo(7);
  });

  it('needs 0.4 g of active dry yeast per gram of fresh', () => {
    expect(convertYeast(10, 'fresh', 'activeDry')).toBeCloseTo(4);
  });

  it('goes from dry back to fresh', () => {
    expect(convertYeast(7, 'instant', 'fresh')).toBeCloseTo(21);
    expect(convertYeast(4, 'activeDry', 'instant')).toBeCloseTo(10 / 3);
  });
});

describe('packs', () => {
  it('counts fresh yeast in cubes and dry yeast in sachets and packets', () => {
    expect(unitsOf('fresh')).toEqual(['grams', 'cube']);
    expect(unitsOf('instant')).toEqual(['grams', 'sachet', 'packet']);
  });

  it('says a cube of fresh yeast is two sachets of dry', () => {
    const instant = yeastNeeded({...DEFAULT_YEAST_INPUTS, amount: 1, unit: 'cube', from: 'fresh', to: 'instant'});
    expect(instant).toBeCloseTo(14);
    expect(inPacks(instant, 'instant')[0]).toEqual({unit: 'sachet', count: 2});
  });

  it('scales to the flour at hand', () => {
    expect(yeastNeeded({...DEFAULT_YEAST_INPUTS, amount: 1, unit: 'cube', from: 'fresh', to: 'fresh', recipeFlourG: 1000,
      myFlourG: 600}))
        .toBeCloseTo(25.2);
  });
});

describe('parseYeastInputs', () => {
  it('counts in grams when the pack does not fit the yeast', () => {
    expect(parseYeastInputs({from: 'instant', unit: 'cube'}).unit).toBe('grams');
  });

  it('falls back to the defaults', () => {
    expect(parseYeastInputs(null)).toEqual(DEFAULT_YEAST_INPUTS);
  });
});

describe('starterNeeded', () => {
  const sachet = {...DEFAULT_YEAST_INPUTS, amount: 1, unit: 'sachet', from: 'instant', to: 'sourdough',
    recipeFlourG: 0, myFlourG: 500} as const;

  it('puts the usual starter in place of a sachet', () => {
    expect(starterNeeded({...sachet, temperatureC: 24}).grams).toBeCloseTo(120);
  });

  it('takes the dough about 4 h bulk and 2 to 4 h proof at 78 to 80 °F', () => {
    const warm = starterNeeded({...sachet, temperatureC: 26});
    expect(warm.hours).toBeGreaterThan(5);
    expect(warm.hours).toBeLessThan(9);
    expect(warm.hours).toBeLessThan(starterNeeded({...sachet, temperatureC: 20}).hours);
  });
});
