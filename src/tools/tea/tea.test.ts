import {describe, expect, it} from 'vitest';
import {calculateTea, DEFAULT_TEA_INPUTS, parseTeaInputs} from './tea';

describe('calculateTea', () => {
  it('steeps black tea with about 13 g per litre near the boil', () => {
    const result = calculateTea({type: 'black', waterMl: 1000, iced: false});
    expect(result.teaG).toBeCloseTo(13);
    expect(result.temperatureC.high).toBeGreaterThanOrEqual(95);
  });

  it('keeps green tea well below the boil', () => {
    expect(calculateTea({type: 'green', waterMl: 500, iced: false}).temperatureC.high).toBeLessThan(90);
  });

  it('brews iced tea twice as strong over the same weight of ice', () => {
    const hot = calculateTea({type: 'black', waterMl: 1000, iced: false});
    const iced = calculateTea({type: 'black', waterMl: 1000, iced: true});
    expect(iced.teaG).toBeCloseTo(2 * hot.teaG);
    expect(iced.iceG).toBe(1000);
  });

  it('whisks matcha instead of steeping it', () => {
    const result = calculateTea({type: 'matchaUsucha', waterMl: 70, iced: false});
    expect(result.minutes).toBeUndefined();
    expect(result.teaG).toBeCloseTo(2.1, 1);
  });
});

it('ices only black and green tea', () => {
  expect(parseTeaInputs({type: 'rooibos', iced: true}).iced).toBe(false);
  expect(parseTeaInputs(undefined)).toEqual(DEFAULT_TEA_INPUTS);
});
