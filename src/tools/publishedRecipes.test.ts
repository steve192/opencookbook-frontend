/**
 * Published recipes in different configurations against what the tools calculate for them. A tool may differ from
 * a recipe by about as much as recipes of one kind differ among themselves, so each quantity has its own tolerance.
 */
import {describe, expect, it} from 'vitest';
import {BreadInputs, calculateBread, DEFAULT_BREAD_INPUTS} from './bread/bread';
import {calculateCoffee, CoffeeInputs, DEFAULT_COFFEE_INPUTS} from './coffee/coffee';
import {Stage} from './fermentation/fermentation';
import {convertOven, DEFAULT_OVEN_INPUTS, OvenInputs} from './oven/oven';
import {DEFAULT_PARTY_INPUTS, PartyInputs, planParty} from './party/party';
import {calculatePizza, defaultPizzaInputs, PizzaInputs} from './pizza/pizza';
import {PizzaStyle} from './pizza/pizzaData';
import {calculateTea, TeaInputs} from './tea/tea';
import {convertYeast, DEFAULT_YEAST_INPUTS, starterNeeded} from './yeast/yeast';

const TOLERANCE = {
  /** Percentage points of the flour. */
  hydration: 6,
  salt: 0.6,
  /** A factor either way: published yeast for one kind of dough lies within about 2.5 of their median. */
  leavener: 2.5,
  /** A share of the published amount. */
  amount: 0.2,
  /** °C either way. */
  temperature: 5,
};

const expectShare = (actual: number, published: number) =>
  expect(Math.abs(actual / published - 1)).toBeLessThanOrEqual(TOLERANCE.amount);
const expectPoints = (actual: number, published: number, points: number) =>
  expect(Math.abs(actual - published)).toBeLessThanOrEqual(points);
const expectFactor = (actual: number, published: number) => {
  expect(actual / published).toBeGreaterThanOrEqual(1 / TOLERANCE.leavener);
  expect(actual / published).toBeLessThanOrEqual(TOLERANCE.leavener);
};

const room = (hours: number): Stage => ({hours, temperatureC: 21});
const cold = (hours: number, temperatureC = 4): Stage => ({hours, temperatureC});

const INCH = 2.54;
const INSTANT_TSP_G = 7 / 2.25;

/** What a dough recipe says, in % of all its flour; dough in grams per piece or tray. */
interface DoughRecipe {
  hydration?: number;
  salt?: number;
  /** The leavener the recipe uses, in its own grams. */
  leavener?: number;
  pieceWeight?: number;
  bakeMinutes?: number;
}

interface PizzaRecipe {
  name: string;
  inputs: Partial<PizzaInputs> & {style: PizzaStyle};
  recipe: DoughRecipe;
}

const PIZZAS: PizzaRecipe[] = [
  {
    name: 'Neapolitan by the EU specification: 1 l water, 1.8 kg flour, 3 g yeast, 2 h and 4 to 6 h at 25 °C',
    inputs: {style: 'neapolitan', amountMode: 'flour', flourG: 1800, leavener: 'fresh', roomC: 25,
      stages: [{hours: 2, temperatureC: 25}, {hours: 5, temperatureC: 25}]},
    recipe: {hydration: 1000 / 1800 * 100, salt: 52.5 / 1800 * 100, leavener: 3 / 1800 * 100},
  },
  {
    name: 'Neapolitan, three 30 cm pizzas after 8 to 24 h on the counter',
    inputs: {style: 'neapolitan', amountMode: 'pizzas', count: 3, diameterCm: 30, leavener: 'fresh',
      stages: [room(16)]},
    recipe: {hydration: 250 / 425 * 100, salt: 13 / 425 * 100, leavener: 0.25 / 425 * 100, pieceWeight: 225},
  },
  {
    name: 'Contemporary, 2 h, 24 to 48 h at 2 to 4 °C, 5 h, then 2 min at 380 °C',
    inputs: {style: 'contemporary', amountMode: 'flour', flourG: 1000, leavener: 'fresh', oven: 'pizzaOven',
      stages: [room(2), cold(36, 3), room(5)]},
    recipe: {hydration: 67.5, salt: 2.65, bakeMinutes: 2},
  },
  {
    name: 'New York, four 14 inch pizzas after three days in the fridge',
    inputs: {style: 'newYork', amountMode: 'pizzas', count: 4, diameterCm: 14 * INCH, leavener: 'instant',
      stages: [cold(72), room(1)]},
    recipe: {hydration: 62, salt: 2, leavener: 0.4, pieceWeight: 326},
  },
  {
    name: 'Roman teglia, one 30 x 40 cm tray after 44 h in the fridge, 15 to 16 min in the oven',
    inputs: {style: 'romanTeglia', amountMode: 'trays', count: 1, trayWidthCm: 30, trayLengthCm: 40,
      leavener: 'fresh', stages: [room(1.25), cold(44), room(3.5)]},
    recipe: {hydration: 290 / 350 * 100, salt: 7 / 350 * 100, leavener: 2 / 350 * 100, pieceWeight: 656,
      bakeMinutes: 15.5},
  },
  {
    name: 'Roman teglia, 500 g flour after 24 h in the fridge',
    inputs: {style: 'romanTeglia', amountMode: 'flour', flourG: 500, leavener: 'fresh',
      stages: [room(110 / 60), cold(24), room(3)]},
    recipe: {hydration: 80, salt: 2, leavener: 3 / 500 * 100},
  },
  {
    name: 'Pinsa, 655 g flour after three and a half days in the fridge',
    inputs: {style: 'pinsa', amountMode: 'flour', flourG: 655, leavener: 'instant', stages: [cold(84), room(3)]},
    recipe: {hydration: 480 / 655 * 100, leavener: 3 / 655 * 100},
  },
  {
    name: 'Focaccia, one 30 x 40 cm tray, the same day somewhere warm',
    inputs: {style: 'focaccia', amountMode: 'trays', count: 1, trayWidthCm: 30, trayLengthCm: 40,
      leavener: 'fresh', stages: [room(2.5)]},
    recipe: {hydration: (250 + 50) / 500 * 100, leavener: 3, pieceWeight: 871},
  },
  {
    name: 'Sicilian, one 13 x 18 inch sheet pan, 3 h',
    inputs: {style: 'sicilian', amountMode: 'trays', count: 1, trayWidthCm: 13 * INCH, trayLengthCm: 18 * INCH,
      leavener: 'instant', stages: [room(3)]},
    recipe: {hydration: 394 / 616 * 100, leavener: INSTANT_TSP_G / 616 * 100,
      pieceWeight: 616 + 394 + 15 + 4 + INSTANT_TSP_G + 27},
  },
  {
    name: 'Blechpizza, two 7 g sachets of dry yeast for 500 g flour, 45 to 60 min',
    inputs: {style: 'blechpizza', amountMode: 'flour', flourG: 500, leavener: 'instant', stages: [room(0.875)]},
    recipe: {hydration: 250 / 500 * 100, leavener: 14 / 500 * 100},
  },
];

const checkPizza = ({inputs, recipe}: PizzaRecipe) => {
  const result = calculatePizza({...defaultPizzaInputs(inputs.style), preset: 'custom', ...inputs});
  const {amounts} = result;
  const percent = (grams: number) => grams / amounts.totalFlour * 100;
  if (recipe.hydration != null) {
    expectPoints(percent(amounts.water), recipe.hydration, TOLERANCE.hydration);
  }
  if (recipe.salt != null) {
    expectPoints(percent(amounts.salt), recipe.salt, TOLERANCE.salt);
  }
  if (recipe.leavener != null) {
    expectFactor(amounts.leavenerPercent, recipe.leavener);
  }
  if (recipe.pieceWeight != null) {
    expectShare(result.pieceWeight, recipe.pieceWeight);
  }
  if (recipe.bakeMinutes != null) {
    expectShare((result.bake.minutes.low + result.bake.minutes.high) / 2, recipe.bakeMinutes);
  }
  expect(result.warnings).not.toContain('impossibleSchedule');
  expect(result.warnings).not.toContain('tooMuchYeast');
  expect(result.warnings).not.toContain('moreYeastThanStyleAllows');
};

describe('pizza dough against published recipes', () => {
  it.each(PIZZAS)('$name', checkPizza);
});

const BREADS: {name: string, inputs: Partial<BreadInputs>, recipe: DoughRecipe}[] = [
  {
    name: 'No-knead yeast bread, 1 g instant yeast for 430 g flour, 18 h on the counter and 2 h',
    inputs: {type: 'yeast', yeast: 'instant', amountMode: 'flour', flourG: 430, hydration: 345 / 430 * 100,
      stages: [room(20.25)]},
    recipe: {salt: 8 / 430 * 100, leavener: 1 / 430 * 100},
  },
  {
    name: 'Quick white bread, half a 42 g cube for 500 g flour, 90 min',
    inputs: {type: 'yeast', yeast: 'fresh', amountMode: 'flour', flourG: 500, flours: [{flour: 'type405', share: 100}],
      stages: [room(1.54)]},
    recipe: {hydration: 300 / 500 * 100, salt: 2 * 5 * 1.2 / 500 * 100, leavener: 21 / 500 * 100},
  },
  {
    name: 'Sourdough the same day, half its flour as ripe starter, 5 h',
    inputs: {type: 'wheatSourdough', amountMode: 'flour', flourG: 912,
      flours: [{flour: 'type550', share: 90}, {flour: 'wholeWheat', share: 10}], stages: [room(4.92)]},
    recipe: {hydration: (397 + 227) / 912 * 100, salt: 15 / 912 * 100, leavener: 454 / 912 * 100},
  },
  {
    name: 'Sourdough overnight in the fridge, 100 g starter for 500 g flour',
    inputs: {type: 'wheatSourdough', amountMode: 'flour', flourG: 550, flours: [{flour: 'type405', share: 100}],
      hydration: 400 / 550 * 100, stages: [room(5.75), cold(11)]},
    recipe: {salt: 12 / 550 * 100, leavener: 100 / 550 * 100},
  },
];

describe('bread against published recipes', () => {
  it.each(BREADS)('$name', ({inputs, recipe}) => {
    const result = calculateBread({...DEFAULT_BREAD_INPUTS, preset: 'custom', ...inputs});
    const {amounts} = result;
    if (recipe.hydration != null) {
      expectPoints(result.hydration, recipe.hydration, TOLERANCE.hydration);
    }
    if (recipe.salt != null) {
      expectPoints(amounts.salt / amounts.totalFlour * 100, recipe.salt, TOLERANCE.salt);
    }
    if (recipe.leavener != null) {
      expectFactor(amounts.leavenerPercent, recipe.leavener);
    }
    expect(result.warnings).not.toContain('impossibleSchedule');
    expect(result.warnings).not.toContain('tooMuchYeast');
  });
});

describe('yeast conversions against published ones', () => {
  it('turns a 42 g cube of fresh yeast into 14 g instant', () => expectShare(convertYeast(42, 'fresh', 'instant'), 14));

  it('turns a 0.6 oz cake into a 1/4 oz packet of active dry yeast', () =>
    expectShare(convertYeast(0.6, 'fresh', 'activeDry'), 0.25));

  it('swaps a 7 g sachet of instant yeast for 100 to 140 g ripe starter', () => {
    const {grams} = starterNeeded({...DEFAULT_YEAST_INPUTS, amount: 7, unit: 'grams', from: 'instant', to: 'sourdough',
      recipeFlourG: 0, myFlourG: 500});
    expectShare(grams, 100);
    expectShare(grams, 140);
  });
});

const OVENS: {name: string, inputs: Partial<OvenInputs>, published: {temperatureC?: number, minutes: number}}[] = [
  {name: 'top and bottom heat 200 °C for 30 min: fan 180 °C', inputs: {from: 'topBottom', to: 'fan',
    temperatureC: 200, minutes: 30}, published: {temperatureC: 180, minutes: 30}},
  {name: 'muffins, fan 180 °C for 20 min: air fryer 160 °C for 12 to 15 min', inputs: {from: 'fan', to: 'airFryer',
    temperatureC: 180, minutes: 20}, published: {temperatureC: 160, minutes: 13.5}},
  {name: 'cake, fan 180 °C for 50 to 60 min: air fryer 160 °C for 40 to 50 min', inputs: {from: 'fan',
    to: 'airFryer', temperatureC: 180, minutes: 55}, published: {temperatureC: 160, minutes: 45}},
  {name: 'frozen food, 180 °C for 20 min: air fryer 180 °C for 10 min', inputs: {from: 'fan', to: 'airFryer',
    temperatureC: 180, minutes: 20, frozen: true}, published: {temperatureC: 180, minutes: 10}},
  {name: 'frozen pizza, 12 to 15 min in the oven: 7 to 9 min in the air fryer', inputs: {from: 'fan', to: 'airFryer',
    temperatureC: 220, minutes: 13.5, frozen: true}, published: {minutes: 8}},
];

describe('oven conversions against published ones', () => {
  it.each(OVENS)('$name', ({inputs, published}) => {
    const result = convertOven({...DEFAULT_OVEN_INPUTS, ...inputs});
    if (published.temperatureC != null) {
      expectPoints(result.temperatureC, published.temperatureC, TOLERANCE.temperature);
    }
    expectShare(result.minutes!, published.minutes);
  });
});

interface CoffeeRecipe {
  name: string;
  inputs: Partial<CoffeeInputs>;
  published: {coffeeG: number, iceG?: number, dilutionMl?: number};
}

const COFFEES: CoffeeRecipe[] = [
  {name: 'pour-over, 16 g for 250 ml', inputs: {method: 'pourOver', waterMl: 250}, published: {coffeeG: 16}},
  {name: 'French press, 18 g for 250 ml', inputs: {method: 'frenchPress', waterMl: 250}, published: {coffeeG: 18}},
  {name: 'espresso, 18 g for 36 g', inputs: {method: 'espresso', waterMl: 36}, published: {coffeeG: 18}},
  {name: 'Japanese iced coffee, 20 g with 200 g hot water and 100 g ice',
    inputs: {method: 'japaneseIced', waterMl: 300}, published: {coffeeG: 20, iceG: 100}},
  {name: 'cold brew concentrate, 100 g for 500 ml, diluted one to one',
    inputs: {method: 'coldBrewConcentrate', waterMl: 500}, published: {coffeeG: 100, dilutionMl: 500}},
];

describe('coffee against published recipes', () => {
  it.each(COFFEES)('$name', ({inputs, published}) => {
    const result = calculateCoffee({...DEFAULT_COFFEE_INPUTS, basis: 'water', strength: 'medium', ...inputs});
    expectShare(result.coffeeG, published.coffeeG);
    if (published.iceG != null) {
      expectShare(result.iceG!, published.iceG);
    }
    if (published.dilutionMl != null) {
      expectShare(result.dilutionMl!, published.dilutionMl);
    }
  });
});

interface TeaRecipe {
  name: string;
  inputs: TeaInputs;
  published: {teaG: number, temperatureC?: {low: number, high: number}, iceG?: number};
}

const TEAS: TeaRecipe[] = [
  {name: 'green tea, 10 g for a litre at 70 to 80 °C', inputs: {type: 'green', waterMl: 1000, iced: false},
    published: {teaG: 10, temperatureC: {low: 70, high: 80}}},
  {name: 'black tea, 3 g for a 200 ml cup at 95 to 100 °C', inputs: {type: 'black', waterMl: 200, iced: false},
    published: {teaG: 3, temperatureC: {low: 95, high: 100}}},
  {name: 'usucha, 2 g with 65 to 70 ml', inputs: {type: 'matchaUsucha', waterMl: 67.5, iced: false},
    published: {teaG: 2}},
  {name: 'iced black tea, twice the tea for 500 ml over 500 g ice', inputs: {type: 'black', waterMl: 500, iced: true},
    published: {teaG: 2 * 3 / 200 * 500, iceG: 500}},
];

describe('tea against published guides', () => {
  it.each(TEAS)('$name', ({inputs, published}) => {
    const result = calculateTea(inputs);
    expectShare(result.teaG, published.teaG);
    if (published.temperatureC) {
      expectPoints(result.temperatureC.low, published.temperatureC.low, TOLERANCE.temperature);
      expectPoints(result.temperatureC.high, published.temperatureC.high, TOLERANCE.temperature);
    }
    if (published.iceG != null) {
      expectShare(result.iceG!, published.iceG);
    }
  });
});

const adults = (count: number) => ({men: count / 2, women: count / 2, teens: 0, children: 0});
const plan = (inputs: Partial<PartyInputs>) =>
  planParty({...DEFAULT_PARTY_INPUTS, appetite: 'normal', reserve: false, dishes: 1, ...inputs});

describe('party amounts against published planning tables', () => {
  it('plans about 3 kg of meat for a barbecue of ten adults with sides', () => {
    const meat = plan({event: 'bbq', guests: adults(10)}).food.find((line) => line.item === 'grillMeat')!;
    expectShare(meat.grams, 3000);
  });

  it('plans 200 to 250 g of cheese per adult for raclette', () => {
    const cheese = plan({event: 'raclette', guests: adults(4)}).food.find((line) => line.item === 'racletteCheese')!;
    expectShare(cheese.grams, 4 * 225);
  });

  it('plans about a kilogram of food per adult for a buffet', () => {
    const food = plan({event: 'buffet', guests: adults(10)}).food;
    expectShare(food.reduce((sum, line) => sum + line.grams, 0) / 10, 1000);
  });
});
