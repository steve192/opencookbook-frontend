import {describe, expect, it} from 'vitest';
import {convertOven, DEFAULT_OVEN_INPUTS, parseOvenInputs} from './oven';

const convert = (changes: Partial<typeof DEFAULT_OVEN_INPUTS>) => convertOven({...DEFAULT_OVEN_INPUTS, ...changes});

describe('convertOven', () => {
  it('sets a fan oven 20 °C below top and bottom heat and keeps the time', () => {
    expect(convert({from: 'topBottom', to: 'fan', temperatureC: 180, minutes: 30}))
        .toMatchObject({temperatureC: 160, minutes: 30});
  });

  it('goes back up by the same 20 °C', () => {
    expect(convert({from: 'fan', to: 'topBottom', temperatureC: 160})).toMatchObject({temperatureC: 180});
  });

  it('sets an air fryer 20 °C below a fan oven and needs a fifth less time', () => {
    expect(convert({from: 'fan', to: 'airFryer', temperatureC: 180, minutes: 20}))
        .toMatchObject({temperatureC: 160, minutes: 16});
  });

  it('sets an air fryer 40 °C below top and bottom heat', () => {
    expect(convert({from: 'topBottom', to: 'airFryer', temperatureC: 200, minutes: 30}))
        .toMatchObject({temperatureC: 160, minutes: 24});
  });

  it('cooks frozen food in the air fryer 20 °C below the package, in about two thirds of the time', () => {
    expect(convert({from: 'topBottom', to: 'airFryer', temperatureC: 200, minutes: 20, frozen: true}))
        .toMatchObject({temperatureC: 180, minutes: 13});
  });

  it('turns an air fryer recipe back into an oven one', () => {
    expect(convert({from: 'airFryer', to: 'fan', temperatureC: 160, minutes: 24}))
        .toMatchObject({temperatureC: 180, minutes: 30});
  });

  it('gives no time when the recipe has none', () => {
    expect(convert({minutes: 0}).minutes).toBeUndefined();
  });
});

describe('checking early', () => {
  it('checks 5 minutes early, but not on a time short enough that it would be half of it', () => {
    expect(convertOven({...DEFAULT_OVEN_INPUTS, minutes: 30}).checkEarlyMinutes).toBe(5);
    expect(convertOven({...DEFAULT_OVEN_INPUTS, minutes: 10}).checkEarlyMinutes).toBeUndefined();
  });
});

describe('parseOvenInputs', () => {
  it('falls back to the defaults for anything it cannot read', () => {
    expect(parseOvenInputs('nonsense')).toEqual(DEFAULT_OVEN_INPUTS);
    expect(parseOvenInputs({from: 'grill', temperatureC: 2000, frozen: 'yes'})).toEqual(DEFAULT_OVEN_INPUTS);
  });

  it('keeps what it can read', () => {
    expect(parseOvenInputs({from: 'fan', to: 'airFryer', temperatureC: 175, minutes: 12, frozen: true}))
        .toEqual({from: 'fan', to: 'airFryer', temperatureC: 175, minutes: 12, frozen: true});
  });
});

describe('settings appliances may not reach', () => {
  it('warns above what many air fryers and home ovens reach', () => {
    expect(convertOven({...DEFAULT_OVEN_INPUTS, from: 'topBottom', to: 'airFryer', temperatureC: 250}).warnings)
        .toEqual(['airFryerTooHot']);
    expect(convertOven({...DEFAULT_OVEN_INPUTS, from: 'airFryer', to: 'topBottom', temperatureC: 240}).warnings)
        .toEqual(['ovenTooHot']);
    expect(convertOven(DEFAULT_OVEN_INPUTS).warnings).toEqual([]);
  });
});
