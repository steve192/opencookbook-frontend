import {expect, it} from 'vitest';
import {formatTemperature, formatVolume, formatWeight} from './units';

it('keeps two decimals below a gram, as a pinch of yeast matters', () => {
  expect(formatWeight(0.033, 'metric', 'en')).toBe('0.03 g');
  expect(formatWeight(2.34, 'metric', 'en')).toBe('2.3 g');
  expect(formatWeight(612, 'metric', 'en')).toBe('612 g');
});

it('keeps a number and its unit on one line, in the locale\'s notation', () => {
  expect(formatWeight(2.34, 'metric', 'de')).toBe('2,3 g');
  expect(formatTemperature(91, 'metric', 'de')).toBe('91 °C');
  expect(formatVolume(250, 'imperial', 'en')).toBe('8.5 fl oz');
});
