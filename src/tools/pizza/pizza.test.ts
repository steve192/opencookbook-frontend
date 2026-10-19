import {describe, expect, it} from 'vitest';
import {amountModesOf, bakeAdvice, ballPresets, calculatePizza, defaultPizzaInputs, parsePizzaInputs,
  styleFormula} from './pizza';
import {FLOURS, PIZZA_DIAMETERS, PIZZA_FLOURS, PIZZA_STYLES, STYLES} from './pizzaData';

describe('styleFormula', () => {
  it('salts a Neapolitan dough with 50 g per litre of water', () => {
    const formula = styleFormula('neapolitan');
    expect(formula.salt).toBeCloseTo(0.05 * formula.hydration);
    expect(formula.oil).toBe(0);
    expect(formula.sugar).toBe(0);
  });

  it('takes the median of what the sources say', () => {
    // New York: 62, 63, 64, 62 and 57.2 % water.
    expect(styleFormula('newYork').hydration).toBeCloseTo(0.62);
  });

  it('has a sourced hydration and salt for every style', () => {
    for (const style of PIZZA_STYLES) {
      expect(() => styleFormula(style)).not.toThrow();
    }
  });
});

describe('the published data', () => {
  it('has a value for every style and flour', () => {
    for (const style of PIZZA_STYLES) {
      const data = STYLES[style];
      const salt = [...data.salt, ...(data.saltPerLitreWater ?? [])];
      expect([data.hydration, salt, data.oil, data.sugar].every((values) => values.length > 0)).toBe(true);
    }
    for (const flour of PIZZA_FLOURS) {
      expect(FLOURS[flour].maxHydration.length + (FLOURS[flour].maxHours ?? []).length).toBeGreaterThan(0);
    }
  });
});

describe('calculatePizza', () => {
  const neapolitan = defaultPizzaInputs('neapolitan');

  it('weighs four 240 g balls', () => {
    const result = calculatePizza({...neapolitan, amountMode: 'balls', count: 4, ballWeightG: 240});
    expect(result.amounts.total).toBeCloseTo(960, 0);
    expect(result.pieces).toBe(4);
  });

  it('sizes balls for a pizza diameter from the style\'s thickness', () => {
    const small = calculatePizza({...neapolitan, amountMode: 'pizzas', count: 1, diameterCm: 24});
    const large = calculatePizza({...neapolitan, amountMode: 'pizzas', count: 1, diameterCm: 32});
    expect(large.pieceWeight / small.pieceWeight).toBeCloseTo((32 / 24) ** 2);
  });

  it('counts the balls a bag of flour makes', () => {
    const result = calculatePizza({...neapolitan, amountMode: 'flour', flourG: 1000});
    expect(result.amounts.totalFlour).toBe(1000);
    expect(result.pieces).toBe(Math.floor(result.amounts.total / neapolitan.ballWeightG));
  });

  it('takes the starter\'s flour and water off what is weighed in', () => {
    const result = calculatePizza({...neapolitan, amountMode: 'flour', flourG: 1000, leavener: 'sourdough'});
    const {amounts} = result;
    expect(amounts.flour + amounts.leavener / 2).toBeCloseTo(1000);
    expect(amounts.water + amounts.leavener / 2).toBeCloseTo(styleFormula('neapolitan').hydration * 1000);
  });

  it('sizes pan pizzas by the tray', () => {
    expect(amountModesOf('detroit')).toEqual(['trays', 'flour']);
    const one = calculatePizza({...defaultPizzaInputs('detroit'), count: 1, trayWidthCm: 25, trayLengthCm: 35});
    const two = calculatePizza({...defaultPizzaInputs('detroit'), count: 2, trayWidthCm: 25, trayLengthCm: 35});
    expect(two.amounts.total).toBeCloseTo(2 * one.amounts.total);
  });

  it('splits a pinsa\'s flour into wheat, rice and soy', () => {
    const result = calculatePizza({...defaultPizzaInputs('pinsa'), amountMode: 'flour', flourG: 480});
    // The median recipe puts 40 g rice flour in 655 g.
    expect(result.blend!.rice).toBeCloseTo(480 * 40 / 655, 1);
    expect(result.amounts.flour + result.blend!.rice + result.blend!.soy).toBeCloseTo(480);
  });

  it('warns when a flour does not last as long as the schedule', () => {
    const result = calculatePizza({...neapolitan, flour: 'tipo00', preset: 'fridge72'});
    expect(result.warnings).toContain('flourTooWeakForTime');
    expect(calculatePizza({...neapolitan, flour: 'tipo00Strong', preset: 'fridge24'}).warnings)
        .not.toContain('flourTooWeakForTime');
  });

  it('uses the W value from the bag when given', () => {
    const result = calculatePizza({...neapolitan, flour: 'tipo00', wValue: 380, preset: 'fridge72'});
    expect(result.warnings).not.toContain('flourTooWeakForTime');
  });

  it('finds an amount even for a short, cold schedule, as the dough leaves the kneading warm', () => {
    const result = calculatePizza({...neapolitan, preset: 'custom', stages: [{hours: 3, temperatureC: 1}]});
    expect(result.warnings).not.toContain('impossibleSchedule');
    expect(result.amounts.leavener).toBeGreaterThan(calculatePizza(neapolitan).amounts.leavener);
  });

  it('asks for about the yeast its style\'s recipes use on their schedule', () => {
    // A quarter teaspoon of instant yeast for 360 g flour, 10 hours at room temperature.
    const result = calculatePizza({...defaultPizzaInputs('newYork'), amountMode: 'flour', flourG: 360,
      leavener: 'instant', preset: 'custom', stages: [{hours: 10, temperatureC: 21}]});
    expect(result.amounts.leavener / (7 / 9)).toBeGreaterThan(0.8);
    expect(result.amounts.leavener / (7 / 9)).toBeLessThan(1.25);
  });

  it('finds a quick schedule too short for sourdough, which would need more starter than recipes use', () => {
    const result = calculatePizza({...defaultPizzaInputs('blechpizza'), leavener: 'sourdough', preset: 'quick'});
    expect(result.warnings).toContain('impossibleSchedule');
    expect(calculatePizza({...defaultPizzaInputs('blechpizza'), leavener: 'sourdough', preset: 'fridge24'}).warnings)
        .not.toContain('impossibleSchedule');
  });

  it('warns about more yeast than any recipe uses, as a too short schedule needs', () => {
    expect(calculatePizza({...defaultPizzaInputs('newYork'), preset: 'custom', stages: [{hours: 0.5, temperatureC: 21}]})
        .warnings).toContain('tooMuchYeast');
    expect(calculatePizza(defaultPizzaInputs('blechpizza')).warnings).not.toContain('tooMuchYeast');
  });

  it('warns when a Neapolitan dough needs more yeast than its rules allow', () => {
    expect(calculatePizza({...neapolitan, preset: 'quick'}).warnings).toContain('moreYeastThanStyleAllows');
    expect(calculatePizza(neapolitan).warnings).not.toContain('moreYeastThanStyleAllows');
  });

  it('warns when the water would have to hurt the yeast or be colder than ice water', () => {
    // A cold room needs hot water for a warm dough; a hot room and a stand mixer need it below freezing.
    expect(calculatePizza({...neapolitan, preset: 'sameDay', roomC: 10}).warnings).toContain('waterTooHot');
    expect(calculatePizza({...neapolitan, preset: 'fridge24', roomC: 32, kneading: 'machine'}).warnings)
        .toContain('waterTooCold');
    expect(calculatePizza(neapolitan).warnings).not.toContain('waterTooHot');
  });

  it('gives the water temperature for the dough temperature recipes aim for', () => {
    // Rising at room temperature, recipes aim for 75 to 80 °F and 75 to 78 °F: 77 °F, 25 °C.
    const result = calculatePizza({...neapolitan, preset: 'sameDay', roomC: 21, kneading: 'hand'});
    expect(result.waterTemperatureC).toBeCloseTo(3 * 25 - 21 - 21 - 5 * 5 / 9);
  });
});

describe('parsePizzaInputs', () => {
  it('falls back to a size a style supports', () => {
    expect(parsePizzaInputs({style: 'detroit', amountMode: 'balls'}).amountMode).toBe('trays');
  });

  it('keeps a schedule it can read', () => {
    expect(parsePizzaInputs({stages: [{hours: 10, temperatureC: 5}]}).stages).toEqual([{hours: 10, temperatureC: 5}]);
  });
});

describe('bakeAdvice', () => {
  const neapolitan = defaultPizzaInputs('neapolitan');

  it('bakes a round style in a pizza oven as its recipes do', () => {
    expect(bakeAdvice({...neapolitan, oven: 'pizzaOven'})).toEqual({temperatureC: 415, minutes: {low: 1, high: 1.5},
      fit: 'near'});
  });

  it('bakes a pizza oven\'s style in a home oven as recipes for a steel near its hottest setting do', () => {
    // 450 °F: 6 to 8, 500 °F: 5 to 7, 250 °C: 3 to 4.
    expect(bakeAdvice({...neapolitan, oven: 'steel', ovenMaxC: 250})).toEqual({temperatureC: 250,
      minutes: {low: 5, high: 7}, fit: 'near', madeFor: {oven: 'pizzaOven', temperatureC: 415}});
  });

  it('gives a tray time only near the temperatures tray recipes bake at', () => {
    expect(bakeAdvice({...neapolitan, oven: 'tray', ovenMaxC: 250})).toMatchObject({minutes: {low: 9, high: 11},
      fit: 'near'});
    // Hotter than any tray recipe: no slower than the hottest, 10 minutes at 250 °C.
    expect(bakeAdvice({...neapolitan, oven: 'tray', ovenMaxC: 300})).toMatchObject({temperatureC: 300,
      minutes: {low: 10, high: 10}, fit: 'orLess'});
    // Cooler than any: at least as long as the coolest, 8 to 12 minutes at 220 °C.
    expect(bakeAdvice({...neapolitan, oven: 'tray', ovenMaxC: 200})).toMatchObject({temperatureC: 200,
      minutes: {low: 8, high: 12}, fit: 'atLeast'});
  });

  it('never bakes hotter than the style wants', () => {
    const tonda = defaultPizzaInputs('romanTonda');
    expect(bakeAdvice({...tonda, oven: 'stone', ovenMaxC: 320}).temperatureC).toBe(300);
  });

  it('bakes a home oven\'s style as its recipes do where the oven gets hot enough', () => {
    const pinsa = defaultPizzaInputs('pinsa');
    expect(bakeAdvice({...pinsa, oven: 'tray'})).toEqual({temperatureC: 210, minutes: {low: 14, high: 15},
      fit: 'near'});
  });

  it('bakes a home oven\'s style in a cooler oven as its recipes near that temperature do', () => {
    // A focaccia recipe bakes at 200 °C for about 20 minutes.
    expect(bakeAdvice({...defaultPizzaInputs('focaccia'), ovenMaxC: 200})).toEqual({temperatureC: 200,
      minutes: {low: 20, high: 20}, fit: 'near', madeFor: {oven: 'homeOven', temperatureC: 235}});
    // Detroit recipes at 232 °C: 18 to 20 and 12 to 15 minutes.
    expect(bakeAdvice({...defaultPizzaInputs('detroit'), oven: 'pizzaOven', ovenMaxC: 230})).toMatchObject({
      temperatureC: 230, minutes: {low: 15, high: 17.5}, fit: 'near'});
  });
});

describe('size presets', () => {
  it('offers the dough for a small, medium and large pizza where the style says how thin it is', () => {
    const presets = ballPresets('neapolitan');
    expect(presets.map((preset) => preset.diameterCm)).toEqual(PIZZA_DIAMETERS);
    expect(presets.map((preset) => preset.weightG)).toEqual([191, 254, 366]);
    expect(defaultPizzaInputs('neapolitan').ballWeightG).toBe(254);
  });

  it('offers the lightest, median and heaviest published ball elsewhere', () => {
    expect(ballPresets('pinsa')).toEqual([{weightG: 287}, {weightG: 300}, {weightG: 312}]);
    expect(ballPresets('romanTonda')).toEqual([{weightG: 180}]);
  });
});

describe('the oven inputs', () => {
  it('read back what was stored and fall back to a home oven with a tray', () => {
    expect(parsePizzaInputs({oven: 'steel', ovenMaxC: 280})).toMatchObject({oven: 'steel', ovenMaxC: 280});
    expect(parsePizzaInputs({oven: 'grill'})).toMatchObject({oven: 'tray', ovenMaxC: 250});
  });
});

describe('the dough temperature', () => {
  it('aims cooler for dough that goes into the fridge than for dough rising at room temperature', () => {
    const fridge = calculatePizza({...defaultPizzaInputs(), preset: 'fridge24'});
    const room = calculatePizza({...defaultPizzaInputs(), preset: 'sameDay'});
    expect(fridge.waterTemperatureC).toBeLessThan(room.waterTemperatureC);
  });

  it('needs less yeast in a warmer room, as a preset follows the room temperature', () => {
    const cool = calculatePizza({...defaultPizzaInputs(), roomC: 19});
    const warm = calculatePizza({...defaultPizzaInputs(), roomC: 26});
    expect(warm.amounts.leavener).toBeLessThan(cool.amounts.leavener);
  });
});

describe('the recommendations of a style', () => {
  it('start a style with the flour and schedule its recipes use', () => {
    expect(defaultPizzaInputs('neapolitan')).toMatchObject({flour: 'tipo00', preset: 'overnight'});
    expect(defaultPizzaInputs('blechpizza')).toMatchObject({flour: 'type405', preset: 'quick'});
  });
});
