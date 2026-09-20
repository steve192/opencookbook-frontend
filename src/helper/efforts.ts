import {TFunction} from 'i18next';
import {Effort} from '../dao/RestAPI';

/** From the least work to the most. */
export const EFFORTS: Effort[] = ['SIMPLE', 'ANY', 'ELABORATE'];

const EFFORT_LABEL_KEYS = {
  SIMPLE: 'screens.planning.effortSimple',
  ANY: 'screens.planning.effortAny',
  ELABORATE: 'screens.planning.effortElaborate',
} as const;

/**
 * @param {TFunction} t the translation function of the calling screen
 * @param {Effort} effort the effort
 * @return {string} what to call it
 */
export const effortLabel = (t: TFunction, effort: Effort): string => t(EFFORT_LABEL_KEYS[effort]);
