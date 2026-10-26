import {TFunction} from 'i18next';
import {UnitSystem} from '../../tools/units';

/** Translations and units, to put a tool's numbers into words. */
export interface ResultFormat {
  t: TFunction;
  system: UnitSystem;
  locale: string;
}
