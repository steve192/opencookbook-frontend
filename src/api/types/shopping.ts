import {Aisle} from '../aisles';

export type ShoppingProvider = 'COOKPAL' | 'BRING';

export interface ShoppingList {
  id: number;
  /** Null for an unrenamed default list, which the app names itself. */
  name: string | null;
  defaultList: boolean;
  /** Null for your own list; sent along with every call about it. */
  householdId: string | null;
  householdName: string | null;
  version: number;
}

export interface ShoppingItemSource {
  title: string;
  /** Null for a recipe added from the recipe screen. */
  planDate: string | null;
}

export interface ShoppingItem {
  id: string;
  name: string;
  spec: string | null;
  aisle: Aisle;
  aisleManual: boolean;
  /** A Fluent Emoji name; null shows the aisle's. */
  icon: string | null;
  /** Shown first within its aisle until bought; missing on items this device stored before it was sent. */
  prioritized?: boolean;
  status: 'ACTIVE' | 'BOUGHT';
  boughtAt: string | null;
  /** When it was last put on the list; missing on items this device stored before it was sent. */
  addedAt?: string;
  /** A display name; null once that account is gone. */
  addedBy: string | null;
  sources: ShoppingItemSource[];
  deleted: boolean;
  version: number;
}

export interface ShoppingChanges {
  version: number;
  /** The items are the whole list and replace what the device has. */
  full: boolean;
  items: ShoppingItem[];
}

interface ShoppingOpBase {
  opId: string;
  /** Chosen on the device, so an item added offline can be changed before it was ever synced. */
  itemId: string;
}

/** One change made on the device, possibly offline, applied by the server in the order made. */
export type ShoppingOp =
  | ShoppingOpBase & {type: 'ADD', name: string, spec?: string | null, aisle?: Aisle | null, icon?: string | null,
      sources?: ShoppingItemSource[], prioritized?: boolean}
  | ShoppingOpBase & {type: 'UPDATE', name?: string, spec?: string, aisle?: Aisle, prioritized?: boolean}
  | ShoppingOpBase & {type: 'BUY'}
  | ShoppingOpBase & {type: 'RESTORE', spec?: string | null}
  | ShoppingOpBase & {type: 'DELETE'};

/** Something to tap when adding to a list; per language, the name to show comes first. */
export interface ShoppingTile {
  key: string;
  aisle: Aisle;
  icon: string | null;
  names: Record<string, string[]>;
}

/** What adding to a list needs, kept on the device for adding offline. */
export interface ShoppingVocabulary {
  tiles: ShoppingTile[];
  /** Normalised, of every language. */
  unitWords: string[];
}

/** One ingredient of one meal as the recipe states it. */
export interface PreviewLine {
  name: string;
  nameKey: string;
  amount: number | null;
  unit: string | null;
  /** "g" or "ml" across metric units, otherwise the unit itself. */
  mergeUnit: string;
  /** Turns the amount into mergeUnit. */
  mergeFactor: number;
  aisle: Aisle;
  icon: string | null;
  staple: boolean;
}

export interface PreviewMeal {
  entryId: string;
  date: string | null;
  title: string;
  recipeId: number | null;
  spontaneous: boolean;
  recipeServings: number;
  defaultServings: number;
  /** The day whose cooking this meal eats; nothing is bought for it. */
  leftoverOf: string | null;
  lines: PreviewLine[];
}

/** A line as the import sheet finished it. */
export interface ImportLine {
  name: string;
  spec?: string | null;
  aisle?: Aisle | null;
  icon?: string | null;
  sources: ShoppingItemSource[];
}

/** A line an import offered, and whether it was taken; how staples are learned. */
export interface ShownLine {
  name: string;
  ticked: boolean;
}

export interface Staple {
  id: number;
  name: string;
}
