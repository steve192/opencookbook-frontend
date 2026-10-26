import {ImportLine, PreviewMeal, ShoppingItem, ShoppingRegular, ShownLine} from '../../api/types/shopping';
import {MealChoice, SheetLine} from './importLines';
import {nameKey} from './names';
import {dueBy} from './suggestions';

/** A tick the person set by hand, by line key; it survives the checklist being recomputed. */
export type Ticks = Record<string, boolean>;

/**
 * How the sheet starts: what is still ahead is included, each meal at the servings the server
 * suggested unless the caller already knows better (the recipe screen's servings).
 *
 * @param {PreviewMeal[]} meals from the preview
 * @param {string} today yyyy-MM-dd, for leaving out what was eaten already
 * @param {object} options whether to leave out earlier days, and servings to use instead
 * @return {MealChoice[]} one choice per meal
 */
export const initialChoices = (meals: PreviewMeal[], today: string,
    options: {onlyFromToday: boolean, servings?: number}): MealChoice[] =>
  meals.map((meal) => ({
    meal,
    included: !options.onlyFromToday || meal.date === null || meal.date >= today,
    servings: options.servings ?? meal.defaultServings,
    typedItems: [],
  }));

// Neither a meal without a recipe nor leftovers.
export const isShoppedFor = (meal: PreviewMeal): boolean => !meal.spontaneous && !meal.leftoverOf;

export const isTicked = (line: SheetLine, ticks: Ticks): boolean => ticks[line.key] ?? !line.staple;

/**
 * What an import sends: the ticked lines, and every line that was offered, for learning staples.
 *
 * @param {SheetLine[]} lines the checklist
 * @param {Ticks} ticks what was ticked by hand
 * @return {object} the lines to add and the lines shown
 */
export const importRequest = (lines: SheetLine[], ticks: Ticks): {lines: ImportLine[], shown: ShownLine[]} => ({
  lines: lines.filter((line) => isTicked(line, ticks)).map(importLineOf),
  shown: lines.map((line) => ({name: line.name, ticked: isTicked(line, ticks)})),
});

export const importLineOf = (line: SheetLine): ImportLine =>
  ({name: line.name, spec: line.spec, aisle: line.aisle, icon: line.icon, sources: line.sources});

/** A regular item of the target list offered beside the meals' ingredients. */
export interface DueLine extends SheetLine {
  everyDays: number;
}

/**
 * What the target list buys regularly and is due by the end of the imported week, unless it is among the meals'
 * ingredients.
 *
 * @param {ShoppingRegular[]} regulars the target list's
 * @param {ShoppingItem[]} items the target list's, as this device holds them
 * @param {SheetLine[]} lines the meals' ingredients
 * @param {Date} now this device's clock
 * @param {string} weekEnd yyyy-MM-dd, the week's last day
 * @return {DueLine[]} one line per due name
 */
export const dueLines = (regulars: ShoppingRegular[], items: ShoppingItem[], lines: SheetLine[], now: Date,
    weekEnd: string): DueLine[] => {
  const covered = new Set(lines.map((line) => nameKey(line.name)));
  return dueBy(regulars, items, now, weekEnd).flatMap(({name, aisle, icon, everyDays}) =>
    everyDays === null || covered.has(nameKey(name)) ? [] :
      [{key: `due:${nameKey(name)}`, name, spec: null, aisle, icon, staple: false, sources: [], everyDays}]);
};
