import {describe, expect, it} from 'vitest';
import {calculateTea, DEFAULT_TEA_INPUTS, methodsOf, parseTeaInputs, RAW_HERBS, steepRange, TeaInputs} from './tea';

const tea = (changes: Partial<TeaInputs>) => calculateTea({...DEFAULT_TEA_INPUTS, ...changes});

describe('calculateTea', () => {
  it('steeps black tea with about 13 g per litre near the boil', () => {
    const result = tea({type: 'black', waterMl: 1000});
    expect(result.teaG).toBeCloseTo(13);
    expect(result.temperatureC!.high).toBeGreaterThanOrEqual(95);
  });

  it('keeps green tea well below the boil', () => {
    expect(tea({type: 'green'}).temperatureC!.high).toBeLessThan(90);
  });

  it('steeps oolong between green and black tea', () => {
    const oolong = tea({type: 'oolong', waterMl: 1000});
    expect(oolong.teaG).toBeCloseTo(15);
    expect(oolong.temperatureC).toEqual({low: 85, high: 92.75});
  });

  it('brews iced tea twice as strong over the same weight of ice', () => {
    const hot = tea({type: 'black', waterMl: 1000});
    const iced = tea({type: 'black', waterMl: 1000, method: 'iced'});
    expect(iced.teaG).toBeCloseTo(2 * hot.teaG);
    expect(iced.iceG).toBe(1000);
    expect(iced.infusions).toBeUndefined();
  });

  it('cold brews 12 g per litre for hours in the fridge, green tea shortest', () => {
    const green = tea({type: 'green', method: 'coldBrew', waterMl: 1000});
    expect(green.teaG).toBeCloseTo(12);
    expect(green.hours).toBe(3);
    expect(green.temperatureC).toBeUndefined();
    expect(tea({type: 'black', method: 'coldBrew'}).hours).toBe(10);
  });

  it('makes tea stronger with more leaf, not a longer steep', () => {
    const normal = tea({});
    const strong = tea({strength: 'strong'});
    expect(strong.teaG / normal.teaG).toBeCloseTo(1.5);
    expect(tea({strength: 'light'}).teaG / normal.teaG).toBeCloseTo(0.6);
    expect(strong.minutes).toEqual(normal.minutes);
  });

  it('steeps green and white tea three times, oolong four and black tea once, each 45 s longer', () => {
    expect(tea({type: 'green'}).infusions).toEqual({count: 3, stepMinutes: 0.75});
    expect(tea({type: 'white'}).infusions?.count).toBe(3);
    expect(tea({type: 'oolong'}).infusions?.count).toBe(4);
    expect(tea({type: 'black'}).infusions).toBeUndefined();
  });

  it('whisks matcha instead of steeping it, in its own strength', () => {
    const result = tea({type: 'matchaUsucha', waterMl: 70, strength: 'strong'});
    expect(result.minutes).toBeUndefined();
    expect(result.teaG).toBeCloseTo(2.1, 1);
  });
});

describe('methods', () => {
  it('makes every steeped tea hot, cold brewed or iced, and whisks matcha', () => {
    expect(methodsOf('green')).toEqual(['hot', 'coldBrew', 'iced']);
    expect(methodsOf('herbal')).toEqual(['hot', 'coldBrew', 'iced']);
    expect(methodsOf('matchaKoicha')).toEqual(['hot']);
  });

  it('cold brews herbal tea about 10 h and rooibos about 8 h, and marks them as raw herbs', () => {
    expect(tea({type: 'herbal', method: 'coldBrew'}).hours).toBe(10);
    expect(tea({type: 'rooibos', method: 'coldBrew'}).hours).toBe(8);
    expect(RAW_HERBS).toEqual(['herbal', 'rooibos']);
  });

  it('reads back only a method the tea is made with', () => {
    expect(parseTeaInputs({type: 'matchaUsucha', method: 'coldBrew'}).method).toBe('hot');
    expect(parseTeaInputs({type: 'oolong', method: 'coldBrew'}).method).toBe('coldBrew');
    expect(parseTeaInputs(undefined)).toEqual(DEFAULT_TEA_INPUTS);
  });
});

describe('steeping time', () => {
  it('starts in the middle of the guides\' time and keeps a chosen one within what can be chosen', () => {
    expect(tea({type: 'black'}).steepMinutes).toBe(3.5);
    expect(tea({type: 'black', steepMinutes: 6}).steepMinutes).toBe(6);
    expect(tea({type: 'black', steepMinutes: 20}).steepMinutes).toBe(steepRange('black').high);
    expect(steepRange('green')).toEqual({low: 1, high: 7});
  });

  it('describes a short steep as fresh, the middle as round, a long one as full, and past the guides as bitter', () => {
    expect(tea({type: 'green', steepMinutes: 1.5}).taste).toBe('fresh');
    expect(tea({type: 'green', steepMinutes: 2}).taste).toBe('round');
    expect(tea({type: 'green', steepMinutes: 2.75}).taste).toBe('full');
    expect(tea({type: 'green', steepMinutes: 5}).taste).toBe('bitter');
    expect(tea({type: 'herbal', steepMinutes: 9}).taste).toBe('strong');
  });

  it('times further infusions from the steep chosen', () => {
    const result = tea({type: 'oolong', steepMinutes: 3});
    expect(result.steepMinutes).toBe(3);
    expect(result.infusions).toEqual({count: 4, stepMinutes: 0.75});
  });
});
