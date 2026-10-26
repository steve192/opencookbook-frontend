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

/** As sent: with when it was made, by this device's clock, which dates the list's history. */
export type DatedShoppingOp = ShoppingOp & {at: string};

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

/** A name a list held lately, offered again while typing. */
export interface ShoppingEntry {
  name: string;
  aisle: Aisle;
  icon: string | null;
  lastUsedAt: string;
}

/** A name a list buys at a steady rhythm, or one somebody chose not to have suggested. */
export interface ShoppingRegular {
  id: number;
  name: string;
  aisle: Aisle;
  icon: string | null;
  /** Null for a muted name whose purchases no longer make a rhythm. */
  everyDays: number | null;
  lastBoughtAt: string | null;
  muted: boolean;
  /**
   * When it is suggested, by this device's clock: while one of them is open, unless the name is on the list or was
   * bought since lastBoughtAt. None while muted.
   */
  windows: {from: string, until: string}[];
}

/** What a person did to an item, as the list's history records it. */
export type ItemChange = 'ADDED' | 'RESTORED' | 'BOUGHT' | 'REMOVED' | 'RENAMED' | 'SPEC_CHANGED' | 'AISLE_CHANGED' |
  'PRIORITIZED' | 'UNPRIORITIZED';

/** One change a person made to an item of a list. */
export interface ShoppingListEvent {
  id: number;
  at: string;
  kind: ItemChange;
  /** As the item was named after the change. */
  name: string;
  aisle: Aisle;
  icon: string | null;
  /** What was asked for when added, or the new amount. */
  spec: string | null;
  /** Before a rename. */
  previousName: string | null;
  /** A display name; null once that account is gone. */
  actor: string | null;
  /** Made by whoever is looking. */
  byViewer: boolean;
  /** The meals an addition was imported for. */
  sources: ShoppingItemSource[];
}

export interface ShoppingHistoryPage {
  events: ShoppingListEvent[];
  /** No older page follows. */
  last: boolean;
}

export interface Staple {
  id: number;
  name: string;
}
