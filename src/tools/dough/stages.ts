import {Stage} from '../fermentation/fermentation';
import {asRawInputs, RawInputs, readList, readNumber} from '../inputs';

/** A ready-made schedule; its stages follow the room temperature. */
export type SchedulePreset = 'quick' | 'sameDay' | 'daylong' | 'overnight' | 'fridge24' | 'fridge48' | 'fridge72';

export const SCHEDULE_PRESETS: readonly SchedulePreset[] = ['quick', 'sameDay', 'daylong', 'overnight', 'fridge24',
  'fridge48', 'fridge72'];

/** A preset, or stages of one's own. */
export type ScheduleChoice = SchedulePreset | 'custom';

export const SCHEDULE_CHOICES: readonly ScheduleChoice[] = [...SCHEDULE_PRESETS, 'custom'];

/** The fridge temperature of the presets: published schedules keep dough at 3 to 6 °C; this is their median. */
export const FRIDGE_C = 4;

/** Up to this temperature a stage is the fridge. */
export const FRIDGE_MAX_C = 8;

/** Room temperature as recipes mean it: 65 to 70 °F and 70 to 72 °F, to whole degrees. */
export const ROOM_C = 21;

/**
 * Hours at room temperature: medians of published quick, same-day and overnight schedules, to whole hours. A whole day
 * is the shortest long rise published (12 to 24 hours, at least 12, 12 to 18), from breakfast to dinner.
 */
const ROOM_HOURS: Record<'quick' | 'sameDay' | 'daylong' | 'overnight', number> = {quick: 1, sameDay: 7, daylong: 12,
  overnight: 16};

/** Hours at room temperature before and after the fridge: medians of published schedules, to whole hours. */
const BEFORE_FRIDGE_H = 1;
const AFTER_FRIDGE_H = 3;

/**
 * A preset's stages at a given room temperature.
 *
 * @param {SchedulePreset} preset the preset
 * @param {number} roomC the room temperature
 * @return {Stage[]} its stages
 */
export const presetStages = (preset: SchedulePreset, roomC: number): Stage[] => {
  const fridge = (totalHours: number): Stage[] => [{hours: BEFORE_FRIDGE_H, temperatureC: roomC},
    {hours: totalHours - BEFORE_FRIDGE_H - AFTER_FRIDGE_H, temperatureC: FRIDGE_C},
    {hours: AFTER_FRIDGE_H, temperatureC: roomC}];
  switch (preset) {
    case 'quick':
    case 'sameDay':
    case 'daylong':
    case 'overnight': return [{hours: ROOM_HOURS[preset], temperatureC: roomC}];
    case 'fridge24': return fridge(24);
    case 'fridge48': return fridge(48);
    case 'fridge72': return fridge(72);
  }
};

/**
 * The stages a schedule choice stands for: a preset's at the room temperature, or one's own.
 *
 * @param {ScheduleChoice} choice the preset, or 'custom'
 * @param {Stage[]} ownStages the stages of one's own
 * @param {number} roomC the room temperature
 * @return {Stage[]} the stages
 */
export const scheduleStages = (choice: ScheduleChoice, ownStages: Stage[], roomC: number): Stage[] =>
  choice === 'custom' ? ownStages : presetStages(choice, roomC);

export const readStages = (raw: RawInputs, fallback: Stage[]): Stage[] =>
  readList(raw, 'stages', (entry) => ({
    hours: readNumber(entry, 'hours', 1, 0.25, 120),
    temperatureC: readNumber(entry, 'temperatureC', 20, 0, 40),
  }), 6, fallback);

export const totalHours = (stages: Stage[]): number => stages.reduce((sum, stage) => sum + stage.hours, 0);

export {asRawInputs};

/** When the dough goes into the oven: a day counted from today and a clock time. */
export interface BakeTime {
  bakeDayOffset: number;
  /** "HH:MM", 24 hours. */
  bakeTime: string;
}

const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export const readBakeTime = (raw: RawInputs, fallback: BakeTime): BakeTime => {
  const time = raw.bakeTime;
  return {
    bakeDayOffset: Math.round(readNumber(raw, 'bakeDayOffset', fallback.bakeDayOffset, 0, 7)),
    bakeTime: typeof time === 'string' && CLOCK.test(time) ? time : fallback.bakeTime,
  };
};

/**
 * A clock time as hours since midnight.
 *
 * @param {string} time "HH:MM"
 * @return {number} hours, such as 19.5 for 19:30
 */
export const clockHours = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

/**
 * Hours since midnight as a clock time.
 *
 * @param {number} hours such as 19.5
 * @return {string} "HH:MM", such as "19:30"
 */
export const clockTime = (hours: number): string => {
  const minutes = Math.round(hours * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

/**
 * The moment a bake time means, seen from now.
 *
 * @param {BakeTime} bake the day and time
 * @param {Date} now the current moment
 * @return {Date} when the dough is baked
 */
export const bakeMoment = (bake: BakeTime, now: Date): Date => {
  const [hours, minutes] = bake.bakeTime.split(':').map(Number);
  const moment = new Date(now);
  moment.setDate(moment.getDate() + bake.bakeDayOffset);
  moment.setHours(hours, minutes, 0, 0);
  return moment;
};
