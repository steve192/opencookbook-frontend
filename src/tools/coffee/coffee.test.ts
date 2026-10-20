import {describe, expect, it} from 'vitest';
import {automatCup, automatDose, calculateCoffee, COFFEE_METHODS, DEFAULT_COFFEE_INPUTS, METHODS, parseCoffeeInputs,
  roastC} from './coffee';

const coffee = (changes: Partial<typeof DEFAULT_COFFEE_INPUTS>) => calculateCoffee({...DEFAULT_COFFEE_INPUTS, ...changes});

describe('strength', () => {
  it('spans what the calculators give, from 1:18 mild to 1:13 strong for pour-over', () => {
    expect(coffee({strength: 'mild'}).ratio).toBe(18);
    expect(coffee({strength: 'medium'}).ratio).toBe(16);
    expect(coffee({strength: 'strong'}).ratio).toBe(13);
  });

  it('pulls espresso as lungo, normale and ristretto', () => {
    expect(coffee({method: 'espresso', strength: 'mild'}).ratio).toBeCloseTo(3.25);
    expect(coffee({method: 'espresso', strength: 'medium'}).ratio).toBe(2);
    expect(coffee({method: 'espresso', strength: 'strong'}).ratio).toBeCloseTo(1.375);
  });

  it('brews a filter machine mild with about 55 g per litre', () => {
    expect(coffee({method: 'filterMachine', waterMl: 1000, strength: 'mild'}).coffeeG).toBeCloseTo(55.2, 0);
  });
});

describe('calculateCoffee', () => {
  it('works from the coffee at hand', () => {
    expect(coffee({method: 'espresso', basis: 'coffee', coffeeG: 18}).waterMl).toBeCloseTo(36);
  });

  it('puts about a third of a Japanese iced coffee\'s water in as ice', () => {
    const result = coffee({method: 'japaneseIced', waterMl: 300});
    // Six recipes: 34 to 37 % as the median of their ranges.
    expect(result.iceG).toBeCloseTo(106.25);
  });

  it('dilutes a cold brew concentrate one to one after 12 to 21 h', () => {
    const result = coffee({method: 'coldBrewConcentrate', waterMl: 500});
    expect(result.dilutionMl).toBeCloseTo(500);
    expect(result.brewTime).toEqual({chosen: 16.5, recommended: {low: 12, high: 21}, unit: 'hours'});
  });

  it('gives the grind most guides give', () => {
    expect(coffee({method: 'pourOver'}).grind).toBe('medium');
    expect(coffee({method: 'espresso'}).grind).toBe('fine');
    expect(coffee({method: 'frenchPress'}).grind).toBe('coarse');
  });

  it('cites every method', () => {
    for (const method of COFFEE_METHODS) {
      expect(METHODS[method].grinds.length).toBeGreaterThan(0);
    }
  });
});

describe('roast and water', () => {
  it('wants cooler water the darker the roast', () => {
    expect(roastC('light').low).toBeCloseTo(95);
    expect(roastC('medium')).toEqual({low: 90, high: expect.closeTo(94.2, 1)});
    expect(roastC('dark').high).toBeLessThan(roastC('medium').high);
  });

  it('pours a kettle at the middle of the roast\'s water unless chosen', () => {
    expect(coffee({roast: 'dark'}).temperatureC).toBeCloseTo((roastC('dark').low + roastC('dark').high) / 2);
    expect(coffee({temperatureC: 85}).temperatureC).toBe(85);
    // A filter machine brews at its own water.
    expect(coffee({method: 'filterMachine', temperatureC: 85}).temperatureC).toBeCloseTo(93.6, 1);
    expect(coffee({method: 'moka'}).temperatureC).toBeUndefined();
  });
});

describe('taste', () => {
  it('judges strength against filter coffee\'s 1.15 to 1.45 % at an ideal 20 % extraction', () => {
    expect(coffee({strength: 'mild'}).taste).toMatchObject({strength: 'balanced', band: {low: 1.15, high: 1.45},
      extraction: 20, extracted: 'ideal'});
    expect(coffee({strength: 'medium'}).taste!.tds).toBeCloseTo(20 / (16 - 2.125), 2);
    expect(coffee({strength: 'strong'}).taste!.strength).toBe('strong');
  });

  it('judges espresso against 8 to 12 %', () => {
    expect(coffee({method: 'espresso'}).taste).toMatchObject({tds: 10, strength: 'balanced'});
    expect(coffee({method: 'espresso', strength: 'mild'}).taste!.strength).toBe('weak');
  });

  it('extracts a French press as the guides measured it: about 16 % at 2:45, 19 to 20 % at 4 min, more later', () => {
    const extraction = (brewTime: number) => coffee({method: 'frenchPress', brewTime}).taste!.extraction;
    expect(extraction(2.75)).toBeCloseTo(16.5, 0);
    expect(extraction(4)).toBeCloseTo(20);
    expect(extraction(8)).toBeGreaterThan(21.5);
  });

  it('extracts more the finer the grind and the hotter the water, and calls it under or over', () => {
    expect(coffee({grind: 'coarse'}).taste).toMatchObject({extracted: 'under'});
    expect(coffee({grind: 'fine'}).taste).toMatchObject({extracted: 'over'});
    expect(coffee({temperatureC: 85}).taste!.extraction).toBeLessThan(20);
    expect(coffee({roast: 'dark', temperatureC: 96}).taste!.extraction).toBeGreaterThan(20);
  });

  it('draws a line for each of the method\'s strengths', () => {
    expect(coffee({}).taste!.lines.map((line) => line.ratio)).toEqual([18, 16, 13]);
  });

  it('judges no brew the guides give no band for', () => {
    expect(coffee({method: 'moka'}).taste).toBeUndefined();
    expect(coffee({method: 'coldBrewReady'}).taste).toBeUndefined();
  });
});

describe('fully automatic machine', () => {
  it('grinds 6 to 12 g over its five strength levels', () => {
    expect(automatDose(1)).toBe(6);
    expect(automatDose(5)).toBe(12);
    expect(coffee({method: 'fullyAutomatic', automatLevel: 3}).coffeeG).toBe(9);
  });

  it('pours a 35 ml espresso or a 125 ml coffee, and no less than a 25 ml ristretto', () => {
    expect(automatCup('espresso')).toBe(35);
    expect(automatCup('coffee')).toBe(125);
    expect(coffee({method: 'fullyAutomatic', waterMl: 10}).waterMl).toBe(25);
  });

  it('brews at 90, 92.5 or 95 °C and judges a coffee as filter and an espresso as espresso', () => {
    expect(coffee({method: 'fullyAutomatic', automatTemperature: 'low'}).temperatureC).toBe(90);
    expect(coffee({method: 'fullyAutomatic', waterMl: 150}).taste!.strength).toBe('balanced');
    expect(coffee({method: 'fullyAutomatic', automatDrink: 'espresso', waterMl: 35, automatLevel: 4}).taste!.strength)
        .toBe('balanced');
  });

  it('loses the water the puck keeps, so its espresso reaches every strength by level and cup', () => {
    const espresso = (waterMl: number, automatLevel: number) =>
      coffee({method: 'fullyAutomatic', automatDrink: 'espresso', waterMl, automatLevel}).taste!.strength;
    expect(espresso(35, 1)).toBe('weak');
    expect(espresso(35, 5)).toBe('balanced');
    expect(espresso(30, 5)).toBe('strong');
    // A maker's own 45 ml espresso stays thin, as the machines' espresso measures thinner than a portafilter's.
    expect(espresso(45, 5)).toBe('weak');
  });
});

it('reads only what it knows', () => {
  expect(parseCoffeeInputs({method: 'turkish', roast: 'burnt', grind: 'dust'})).toEqual(DEFAULT_COFFEE_INPUTS);
});
