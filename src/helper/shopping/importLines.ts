import {Aisle} from '../../dao/aisles';
import {PreviewLine, PreviewMeal, ShoppingItemSource} from '../../dao/RestAPI';
import {formatAmount, servingFactor} from '../servings';
import {nameKey} from './names';
import {parseQuickAdd} from './quickAdd';
import {joinSpecs} from './specs';

/** One meal of the sheet as the person set it. */
export interface MealChoice {
  meal: PreviewMeal;
  included: boolean;
  servings: number;
  /** For a meal without a recipe: what to buy for it, as typed ("2 pizza doughs"). */
  typedItems: string[];
}

/** One line of the checklist: everything the included meals need of one food, in one kind of unit. */
export interface SheetLine {
  key: string;
  name: string;
  spec: string | null;
  /** OTHER for a typed line, which the server then places. */
  aisle: Aisle;
  icon: string | null;
  staple: boolean;
  sources: ShoppingItemSource[];
}

interface Need {
  nameKey: string;
  name: string;
  mergeUnit: string;
  /** In mergeUnit, scaled; null when the recipe says no amount. */
  amount: number | null;
  unit: string;
  mergeFactor: number;
  typedSpec: string | null;
  line?: PreviewLine;
  source: ShoppingItemSource;
}

/** Metric units are shown in the larger one from a thousand up: 1.5 kg rather than 1500 g. */
const LARGER_UNITS: Record<string, string> = {g: 'kg', ml: 'l'};
const THOUSAND = 1000;

const needsOf = (choice: MealChoice, unitWords: ReadonlySet<string>): Need[] => {
  const source = {title: choice.meal.title, planDate: choice.meal.date};
  const factor = servingFactor(choice.meal.recipeServings, choice.servings);
  const fromRecipe = choice.meal.lines.map((line): Need => ({
    nameKey: line.nameKey,
    name: line.name,
    mergeUnit: line.mergeUnit,
    amount: line.amount === null ? null : line.amount * factor * line.mergeFactor,
    unit: (line.unit ?? '').trim(),
    mergeFactor: line.mergeFactor,
    typedSpec: null,
    line,
    source,
  }));
  const typed = choice.typedItems.map((item) => parseQuickAdd(item, unitWords)).filter((item) => item.name.length > 0)
      .map((item): Need => ({
        nameKey: nameKey(item.name), name: item.name, mergeUnit: '', amount: null, unit: '', mergeFactor: 1,
        typedSpec: item.spec, source,
      }));
  return [...fromRecipe, ...typed];
};

const amountSpec = (needs: Need[], locale: string): string | null => {
  const amounts = needs.filter((need) => need.amount !== null);
  if (amounts.length === 0) {
    return null;
  }
  const total = amounts.reduce((sum, need) => sum + (need.amount ?? 0), 0);
  const units = new Set(amounts.map((need) => nameKey(need.unit)));
  if (units.size === 1) {
    return `${formatAmount(total / amounts[0].mergeFactor, locale)} ${amounts[0].unit}`.trim();
  }
  const mergeUnit = amounts[0].mergeUnit;
  const larger = LARGER_UNITS[mergeUnit];
  return larger && total >= THOUSAND ?
    `${formatAmount(total / THOUSAND, locale)} ${larger}` :
    `${formatAmount(total, locale)} ${mergeUnit}`.trim();
};

const uniqueSources = (needs: Need[]): ShoppingItemSource[] =>
  needs.map((need) => need.source).filter((source, index, all) =>
    all.findIndex((other) => other.title === source.title && other.planDate === source.planDate) === index);

const lineOf = (key: string, needs: Need[], locale: string): SheetLine => {
  const placed = needs.find((need) => need.line)?.line;
  const typedSpecs = needs.map((need) => need.typedSpec).filter((spec): spec is string => spec !== null);
  return {
    key,
    name: needs[0].name,
    spec: [amountSpec(needs, locale), ...typedSpecs].reduce<string | null>(joinSpecs, null),
    aisle: placed?.aisle ?? 'OTHER',
    icon: placed?.icon ?? null,
    staple: needs.some((need) => need.line?.staple),
    sources: uniqueSources(needs),
  };
};

/**
 * What the included meals need, one line per food and kind of unit: 200 g and 0.3 kg flour are
 * one line, flour and a cup of flour are two. Lines without an amount join the food's first line.
 *
 * @param {MealChoice[]} choices every meal of the sheet
 * @param {string} locale how amounts are written
 * @param {Set} unitWords for reading what was typed for a meal without a recipe
 * @return {SheetLine[]} in the order the foods first appear
 */
export const sheetLines = (choices: MealChoice[], locale: string, unitWords: ReadonlySet<string>): SheetLine[] => {
  const byFood = new Map<string, Need[]>();
  choices.filter((choice) => choice.included).flatMap((choice) => needsOf(choice, unitWords)).forEach((need) => {
    byFood.set(need.nameKey, [...(byFood.get(need.nameKey) ?? []), need]);
  });
  return [...byFood.entries()].flatMap(([food, needs]) => {
    const units = [...new Set(needs.filter((need) => need.amount !== null).map((need) => need.mergeUnit))];
    if (units.length <= 1) {
      return [lineOf(food, needs, locale)];
    }
    const [first, ...others] = units;
    const withoutAmount = needs.filter((need) => need.amount === null);
    return [
      lineOf(`${food}|${first}`, [...needs.filter((need) => need.mergeUnit === first && need.amount !== null),
        ...withoutAmount], locale),
      ...others.map((unit) => lineOf(`${food}|${unit}`,
          needs.filter((need) => need.mergeUnit === unit && need.amount !== null), locale)),
    ];
  });
};

/**
 * A line as Bring reads it.
 *
 * @param {SheetLine} line the line
 * @return {string} "500 g Mehl"
 */
export const bringLine = (line: SheetLine): string => `${line.spec ?? ''} ${line.name}`.trim();
