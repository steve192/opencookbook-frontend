import {describe, expect, it} from 'vitest';
import {calculateBread, DEFAULT_BREAD_INPUTS, flourWater, maxFlourShare, parseBreadInputs, recommendedHydration,
  withFlourShare, withoutFlour} from './bread';

const bread = (changes: Partial<typeof DEFAULT_BREAD_INPUTS>) => calculateBread({...DEFAULT_BREAD_INPUTS, ...changes});

describe('recommendedHydration', () => {
  it('weighs each flour\'s water by its share', () => {
    const wheat = recommendedHydration([{flour: 'type550', share: 100}]);
    const rye = recommendedHydration([{flour: 'rye1150', share: 100}]);
    expect(recommendedHydration([{flour: 'type550', share: 50}, {flour: 'rye1150', share: 50}]))
        .toBeCloseTo((wheat + rye) / 2);
    expect(rye).toBeGreaterThan(wheat);
  });
});

describe('calculateBread', () => {
  it('weighs a sourdough loaf, counting the starter\'s flour and water', () => {
    const result = bread({type: 'wheatSourdough', amountMode: 'flour', flourG: 500});
    expect(result.amounts.totalFlour).toBe(500);
    expect(result.flourSplit[0].grams + result.amounts.leavener / 2).toBeCloseTo(500);
    expect(result.amounts.salt).toBeCloseTo(500 * 0.01825);
  });

  it('leavens a yeast bread with the yeast at hand', () => {
    const fresh = bread({type: 'yeast', yeast: 'fresh'});
    const instant = bread({type: 'yeast', yeast: 'instant'});
    expect(instant.amounts.leavener).toBeCloseTo(fresh.amounts.leavener / 3, 1);
  });

  it('makes up a hybrid\'s small starter with yeast', () => {
    const result = bread({type: 'hybrid', hybridStarterPercent: 5, preset: 'custom', stages: [{hours: 6, temperatureC: 24}]});
    expect(result.yeastGrams).toBeGreaterThan(0);
    expect(bread({type: 'hybrid', hybridStarterPercent: 49, preset: 'custom', stages: [{hours: 48, temperatureC: 24}]}).yeastGrams)
        .toBe(0);
  });

  it('puts about 38 % of the rye into a sour of dough yield 200 with about 18 % starter', () => {
    const result = bread({type: 'ryeMixed', flours: [{flour: 'rye1150', share: 100}], amountMode: 'flour', flourG: 1000});
    expect(result.sour!.flour).toBeCloseTo(378.5, 1);
    expect(result.sour!.water).toBeCloseTo(378.5, 1);
    expect(result.sour!.starter).toBeCloseTo(69.4, 1);
    expect(result.sour!.hours).toBe(12.5);
    expect(result.stages[0].hours).toBeGreaterThan(0);
  });

  it('acidifies only the rye of a mixed bread', () => {
    const result = bread({type: 'ryeMixed', amountMode: 'flour', flourG: 1000,
      flours: [{flour: 'type1050', share: 40}, {flour: 'rye1150', share: 60}]});
    expect(result.sour!.flour).toBeCloseTo(227.1, 1);
  });

  it('takes the water of additions off the water to weigh in', () => {
    const plain = bread({amountMode: 'flour', flourG: 500});
    const quark = bread({amountMode: 'flour', flourG: 500,
      additions: [{foodId: 1, name: 'Quark', grams: 200, waterPer100g: 82}]});
    expect(plain.amounts.water - quark.amounts.water).toBeCloseTo(164);
  });

  it('takes what fruit and vegetables release: most of a purée, little of raw firm tissue, much of raw zucchini', () => {
    const plain = bread({amountMode: 'flour', flourG: 500});
    const added = (name: string, waterPer100g: number, preparation: 'raw' | 'cooked', starchPer100g = 0) =>
      plain.amounts.water - bread({amountMode: 'flour', flourG: 500,
        additions: [{foodId: 1, name, grams: 100, waterPer100g, preparation, starchPer100g}]}).amounts.water;
    // Puréed pumpkin: water less what its solids and starch keep, about two thirds of its weight.
    expect(added('Kürbis', 84.7, 'cooked', 0.7)).toBeCloseTo(84.7 - 1.04 * (15.3 - 0.7) - 4.21 * 0.7, 1);
    expect(added('Kürbis', 84.4, 'raw')).toBe(0);
    expect(added('Zucchini', 95.7, 'raw')).toBeGreaterThan(60);
    // Mashed potato's starch binds nearly all its water.
    expect(Math.abs(added('Kartoffel', 76.3, 'cooked', 15.2))).toBeLessThan(5);
  });

  it('reproduces the sample recipes within their spread', () => {
    // 400 g pressed potatoes on 500 g flour 550 with 300 ml water.
    const potato = bread({type: 'yeast', amountMode: 'flour', flourG: 500,
      additions: [{foodId: 1, name: 'Kartoffel', grams: 400, waterPer100g: 76.3, preparation: 'cooked', starchPer100g: 15.2}]});
    expect(potato.amounts.water).toBeCloseTo(300, -1);
    // 150 g grated carrot on 500 g flour 550 with 325 ml water.
    const carrot = bread({type: 'yeast', amountMode: 'flour', flourG: 500,
      additions: [{foodId: 2, name: 'Karotte', grams: 150, waterPer100g: 88, preparation: 'raw'}]});
    expect(Math.abs(carrot.amounts.water - 325)).toBeLessThan(25);
  });

  it('says when the additions bring more water than the flour takes, and counts it in the dough', () => {
    const pumpkin = (grams: number) => bread({type: 'yeast', yeast: 'instant', count: 1, loafWeightG: 1500,
      additions: [{foodId: 1, name: 'Kürbis', grams, waterPer100g: 84.7, preparation: 'cooked', starchPer100g: 0.7}]});
    // 1 kg purée in a 1.5 kg loaf brings about 660 g water; its 306 g flour take 187 g.
    expect(pumpkin(1000).amounts.water).toBe(0);
    expect(pumpkin(1000).amounts.excessWater).toBeGreaterThan(0);
    expect(pumpkin(1000).warnings).toContain('additionsTooWet');
    expect(pumpkin(200).warnings).not.toContain('additionsTooWet');
  });

  it('warns about more fruit or vegetables than flour, beyond what recipes use', () => {
    const veg = (grams: number) => bread({amountMode: 'flour', flourG: 500,
      additions: [{foodId: 1, name: 'Kürbis', grams, waterPer100g: 84.4, preparation: 'raw'}]});
    expect(veg(600).warnings).toContain('tooManyAdditions');
    expect(veg(400).warnings).not.toContain('tooManyAdditions');
  });

  it('warns about a rye bread without a sour', () => {
    expect(bread({type: 'yeast', flours: [{flour: 'rye1150', share: 60}, {flour: 'type550', share: 40}]}).warnings)
        .toContain('ryeWithoutSour');
    expect(bread({type: 'ryeMixed', flours: [{flour: 'rye1150', share: 100}]}).warnings).not.toContain('ryeWithoutSour');
    expect(bread({type: 'yeast', flours: [{flour: 'rye1150', share: 30}, {flour: 'type550', share: 70}]}).warnings)
        .not.toContain('ryeWithoutSour');
  });

  it('warns about more yeast than any recipe uses', () => {
    expect(bread({type: 'yeast', preset: 'custom', stages: [{hours: 0.5, temperatureC: 21}]}).warnings)
        .toContain('tooMuchYeast');
    expect(bread({type: 'yeast', preset: 'sameDay'}).warnings).not.toContain('tooMuchYeast');
  });

  it('soaks seeds in their own water, inside the loaf\'s weight', () => {
    const result = bread({count: 1, loafWeightG: 1000,
      additions: [{foodId: 2, name: 'Leinsamen', grams: 100, waterPer100g: 7.5, soakAbsorption: 1.5}]});
    expect(result.soaker).toMatchObject({seeds: 100, water: 150});
    expect(result.pieceWeight).toBeCloseTo(1000);
  });

  it('warns about a soaker beyond what the dough carries', () => {
    const result = bread({amountMode: 'flour', flourG: 500,
      additions: [{foodId: 2, name: 'Leinsamen', grams: 400, waterPer100g: 7.5, soakAbsorption: 1.5}]});
    expect(result.warnings).toContain('soakerTooLarge');
  });
});

describe('parseBreadInputs', () => {
  it('drops additions without a catalogue food', () => {
    expect(parseBreadInputs({additions: [{name: 'x', grams: 10}]}).additions).toEqual([]);
  });

  it('keeps how a vegetable goes in, and nothing else', () => {
    const read = (preparation: unknown) =>
      parseBreadInputs({additions: [{foodId: 1, name: 'Kürbis', grams: 10, preparation}]}).additions[0].preparation;
    expect(read('raw')).toBe('raw');
    expect(read('mashed')).toBeUndefined();
  });

  it('falls back to the defaults', () => {
    expect(parseBreadInputs(undefined)).toEqual(DEFAULT_BREAD_INPUTS);
  });
});

describe('a flour mix', () => {
  const mix = [{flour: 'type550', share: 60}, {flour: 'rye1150', share: 30}, {flour: 'wholeWheat', share: 10}] as const;
  const total = (flours: readonly {share: number}[]) => flours.reduce((sum, part) => sum + part.share, 0);

  it('keeps 100 % when a share changes, the others in their proportions', () => {
    const changed = withFlourShare([...mix], 0, 80);
    expect(changed.map((part) => part.share)).toEqual([80, 15, 5]);
    expect(total(withFlourShare([...mix], 2, 100))).toBe(100);
    expect(withFlourShare([...mix], 2, 100)[2].share).toBe(90);
  });

  it('keeps 100 % when a flour is added or removed', () => {
    expect(withoutFlour([...mix], 1).map((part) => part.share)).toEqual([85, 15]);
    expect(total(withFlourShare([...mix, {flour: 'spelt630', share: 0}], 3, 20))).toBe(100);
  });

  it('reads a stored mix as 100 %', () => {
    expect(total(parseBreadInputs({flours: [{flour: 'type550', share: 100}, {flour: 'rye1150', share: 70}]}).flours))
        .toBe(100);
  });
});

describe('the flours', () => {
  it('give darker flours of a grain more water, between what the sources give', () => {
    expect(flourWater('type812')).toBeGreaterThan(flourWater('type550'));
    expect(flourWater('type812')).toBeLessThan(flourWater('type1050'));
    expect(flourWater('type1600')).toBeLessThan(flourWater('wholeWheat'));
    // The sources give wheat 405 and 550 55 and 67.5 %, whole rye 90 and 87.5 %.
    expect(flourWater('type550')).toBeGreaterThan(55);
    expect(flourWater('type550')).toBeLessThan(67.5);
    expect(flourWater('ryeWholegrain')).toBeCloseTo(89, 0);
  });

  it('take the water bread recipes give other flours', () => {
    expect(flourWater('durum')).toBeCloseTo(75);
    expect(flourWater('buckwheat')).toBe(flourWater('type405'));
  });

  it('warns when a flour with little gluten makes up more than recipes use', () => {
    expect(maxFlourShare('buckwheat')).toBe(50);
    expect(maxFlourShare('spelt630')).toBeUndefined();
    const mix = (share: number) => calculateBread({...DEFAULT_BREAD_INPUTS, type: 'yeast',
      flours: [{flour: 'type550', share: 100 - share}, {flour: 'buckwheat', share}]}).warnings;
    expect(mix(60)).toContain('flourShareTooHigh');
    expect(mix(40)).not.toContain('flourShareTooHigh');
  });

  it('counts every rye flour as rye', () => {
    expect(calculateBread({...DEFAULT_BREAD_INPUTS, type: 'yeast', flours: [{flour: 'rye997', share: 100}]}).warnings)
        .toContain('ryeWithoutSour');
  });
});
