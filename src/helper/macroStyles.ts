import {TFunction} from 'i18next';
import {MacroStyle} from '../dao/RestAPI';

/** The styles a cook can ask for; balanced is what asking for none means. */
export const MACRO_STYLES: MacroStyle[] = ['LOW_CARB', 'LOW_FAT', 'HIGH_PROTEIN'];

const MACRO_STYLE_LABEL_KEYS: Record<MacroStyle, string> = {
  BALANCED: 'screens.suggestion.macroBalanced',
  LOW_CARB: 'screens.suggestion.macroLowCarb',
  LOW_FAT: 'screens.suggestion.macroLowFat',
  HIGH_PROTEIN: 'screens.suggestion.macroHighProtein',
};

/**
 * What to call a macro style on screen, the same in the suggestion and the planning wizard.
 *
 * @param {TFunction} t the translation function of the calling screen
 * @param {MacroStyle} macroStyle the style
 * @return {string} the label
 */
export const macroStyleLabel = (t: TFunction, macroStyle: MacroStyle): string =>
  t(MACRO_STYLE_LABEL_KEYS[macroStyle]);
