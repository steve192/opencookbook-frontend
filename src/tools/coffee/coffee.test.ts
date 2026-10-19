import {describe, expect, it} from 'vitest';
import {calculateCoffee, COFFEE_METHODS, DEFAULT_COFFEE_INPUTS, METHODS, parseCoffeeInputs} from './coffee';

const coffee = (changes: Partial<typeof DEFAULT_COFFEE_INPUTS>) => calculateCoffee({...DEFAULT_COFFEE_INPUTS, ...changes});

describe('calculateCoffee', () => {
  it('brews a filter machine with 55 to 60 g per litre', () => {
    expect(coffee({method: 'filterMachine', waterMl: 1000, strength: 'mild'}).coffeeG).toBeCloseTo(55, 0);
    expect(coffee({method: 'filterMachine', waterMl: 1000, strength: 'strong'}).coffeeG).toBeLessThan(60);
  });

  it('uses more coffee per water the stronger it is', () => {
    const mild = coffee({method: 'frenchPress', strength: 'mild'});
    const strong = coffee({method: 'frenchPress', strength: 'strong'});
    expect(strong.coffeeG).toBeGreaterThan(mild.coffeeG);
  });

  it('works from the coffee at hand', () => {
    expect(coffee({method: 'espresso', basis: 'coffee', coffeeG: 18}).waterMl).toBeCloseTo(36);
  });

  it('puts about a third of a Japanese iced coffee\'s water in as ice', () => {
    const result = coffee({method: 'japaneseIced', waterMl: 300});
    // Six recipes: 34 to 37 % as the median of their ranges.
    expect(result.iceG).toBeCloseTo(106.25);
  });

  it('dilutes a cold brew concentrate one to one', () => {
    const result = coffee({method: 'coldBrewConcentrate', waterMl: 500});
    expect(result.dilutionMl).toBeCloseTo(500);
    expect(result.steep).toEqual({low: 12, high: 21, unit: 'hours'});
  });

  it('cites every method', () => {
    for (const method of COFFEE_METHODS) {
      expect(METHODS[method].ratios.length).toBeGreaterThan(0);
    }
  });
});

it('reads only what it knows', () => {
  expect(parseCoffeeInputs({method: 'turkish'})).toEqual(DEFAULT_COFFEE_INPUTS);
});
