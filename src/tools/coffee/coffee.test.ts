import {describe, expect, it} from 'vitest';
import {automatCup, automatDose, calculateCoffee, carriedRatio, COFFEE_METHODS, DEFAULT_COFFEE_INPUTS, METHODS,
  parseCoffeeInputs, recommendedCoffeeInputs, roastC, strengthRatios} from './coffee';

const coffee = (changes: Partial<typeof DEFAULT_COFFEE_INPUTS>) => calculateCoffee({...DEFAULT_COFFEE_INPUTS, ...changes});

describe('strength', () => {
  it('runs from mild to strong, 1:18 to 1:13 for pour-over in half steps', () => {
    expect(strengthRatios('pourOver')).toEqual([18, 17.5, 17, 16.5, 16, 15.5, 15, 14.5, 14, 13.5, 13]);
    expect(coffee({}).ratio).toBe(16);
    expect(coffee({ratio: 13}).ratio).toBe(13);
  });

  it('keeps a chosen ratio on the scale', () => {
    expect(coffee({ratio: 15.3}).ratio).toBe(15.5);
    expect(coffee({ratio: 25}).ratio).toBe(18);
  });

  it('pulls espresso from a lungo to a ristretto in steps of 0.2', () => {
    expect(strengthRatios('espresso')).toEqual([3.2, 3, 2.8, 2.6, 2.4, 2.2, 2, 1.8, 1.6, 1.4]);
    expect(coffee({method: 'espresso'}).ratio).toBe(2);
  });

  it('keeps the place on the scale when the method changes, so a strong pour-over makes a strong espresso', () => {
    expect(carriedRatio('pourOver', 'espresso', 13)).toBe(1.4);
    expect(carriedRatio('pourOver', 'espresso', 18)).toBe(3.2);
    expect(carriedRatio('pourOver', 'espresso', undefined)).toBeUndefined();
    expect(carriedRatio('fullyAutomatic', 'espresso', 13)).toBeUndefined();
  });

  it('brews a filter machine mild with about 55 g per litre', () => {
    expect(coffee({method: 'filterMachine', waterMl: 1000, ratio: 18}).coffeeG).toBeCloseTo(55.6, 0);
  });
});

describe('calculateCoffee', () => {
  it('works from the coffee at hand', () => {
    expect(coffee({method: 'espresso', basis: 'coffee', coffeeG: 18}).waterMl).toBeCloseTo(36);
  });

  it('puts about a third of a Japanese iced coffee\'s water in as ice', () => {
    const result = coffee({method: 'japaneseIced', waterMl: 300});
    // 34 to 37 % as the median of the ranges.
    expect(result.iceG).toBeCloseTo(106.25);
  });

  it('gives each method its usual grind', () => {
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
    expect(coffee({ratio: 18}).taste).toMatchObject({strength: 'balanced', band: {low: 1.15, high: 1.45},
      extraction: 20, extracted: 'ideal'});
    expect(coffee({}).taste!.tds).toBeCloseTo(20 / (16 - 2.125), 2);
    expect(coffee({ratio: 13}).taste!.strength).toBe('strong');
  });

  it('judges espresso against 8 to 12 %', () => {
    expect(coffee({method: 'espresso'}).taste).toMatchObject({tds: 10, strength: 'balanced'});
    expect(coffee({method: 'espresso', ratio: 3.2}).taste!.strength).toBe('weak');
  });

  it('extracts a French press about 16 % at 2:45, 19 to 20 % at 4 min, more later', () => {
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

  it('judges a moka against 3 to 4 %, thin when mild and strong when strong', () => {
    const moka = (ratio?: number) => coffee({method: 'moka', ratio}).taste!;
    expect(moka()).toMatchObject({band: {low: 3, high: 4}, strength: 'balanced'});
    expect(moka(9).strength).toBe('weak');
    expect(moka(6).strength).toBe('strong');
  });

  it('spreads a steeped brew\'s strength over all the water, as the grounds hold liquid just as strong', () => {
    expect(coffee({method: 'frenchPress'}).taste!.tds).toBeCloseTo(20 / 15);
    expect(coffee({method: 'frenchPress'}).taste!.strength).toBe('balanced');
  });
});

describe('dials', () => {
  it('runs a pour-over and an espresso for their usual time, as grind and pouring set it', () => {
    expect(coffee({brewTime: 6}).taste!.extraction).toBe(coffee({}).taste!.extraction);
    expect(coffee({method: 'espresso', brewTime: 45}).brewTime).toMatchObject({chosen: undefined, brewed: 28});
  });

  it('extracts light roasts a little more and dark ones less', () => {
    const extraction = (roast: 'light' | 'medium' | 'dark') => coffee({roast}).taste!.extraction;
    expect(extraction('light')).toBeCloseTo(20.6, 1);
    expect(extraction('medium')).toBe(20);
    expect(extraction('dark')).toBeCloseTo(19.2, 1);
  });

  it('lands every method\'s recommended settings on ideal extraction, cold brew steeped on the counter', () => {
    for (const method of COFFEE_METHODS) {
      expect(calculateCoffee(recommendedCoffeeInputs({...DEFAULT_COFFEE_INPUTS, method, steeping: 'room',
        grind: 'coarse', temperatureC: 80, ratio: 1})).taste!.extracted).toBe('ideal');
    }
  });
});

describe('cold brew', () => {
  const cold = (changes: Partial<typeof DEFAULT_COFFEE_INPUTS>) =>
    coffee({method: 'coldBrewConcentrate', ...changes});

  it('steeps 12 to 15 h on the counter and 12 to 18 h in the fridge', () => {
    expect(cold({steeping: 'room'}).brewTime).toMatchObject({recommended: {low: 12, high: 15}, chosen: 13.5});
    expect(cold({steeping: 'fridge'}).brewTime).toMatchObject({recommended: {low: 12, high: 18}, chosen: 15});
  });

  it('extracts towards its equilibrium: 21.3 % for medium roast on the counter, 19.8 % cold', () => {
    expect(cold({steeping: 'room', brewTime: 30}).taste!.extraction).toBeCloseTo(21.27, 1);
    expect(cold({steeping: 'fridge', brewTime: 30}).taste!.extraction).toBeCloseTo(19.0, 0);
    // Slower in the fridge: about done on the counter after half a day, in the fridge not yet.
    expect(cold({steeping: 'room', brewTime: 12}).taste!.extracted).toBe('ideal');
    expect(cold({steeping: 'fridge', brewTime: 12}).taste!.extracted).toBe('under');
  });

  it('extracts light roasts more than dark ones', () => {
    const extraction = (roast: 'light' | 'medium' | 'dark') => cold({roast}).taste!.extraction;
    expect(extraction('light')).toBeGreaterThan(extraction('medium'));
    expect(extraction('medium')).toBeGreaterThan(extraction('dark'));
  });

  it('dilutes the concentrate one to one, with as much water as there is concentrate', () => {
    const result = cold({});
    expect(result.dilutionMl).toBeCloseTo(500 - 2.125 * 500 / 6);
    expect(result.taste!.tds).toBeCloseTo(result.taste!.extraction / 12);
  });

  it('judges it as drunk, 1.2 to 1.6 %, and names it as cold brew tastes', () => {
    expect(cold({}).taste).toMatchObject({kind: 'coldBrew', band: {low: 1.2, high: 1.6}});
    // Ready to drink at 1:13.5, steeped on the counter until it stops extracting, it is balanced.
    expect(coffee({method: 'coldBrewReady', steeping: 'room'}).taste).toMatchObject({strength: 'balanced',
      extracted: 'ideal'});
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
    // A 45 ml espresso stays thin: a machine's espresso is thinner than a portafilter's.
    expect(espresso(45, 5)).toBe('weak');
  });
});

it('reads only what it knows', () => {
  expect(parseCoffeeInputs({method: 'turkish', roast: 'burnt', grind: 'dust'})).toEqual(DEFAULT_COFFEE_INPUTS);
});
