import {nameKey} from './names';
import {TypedEntry} from './tiles';

export const TYPED_TILE_KEY = 'typed';

// The tile offering what is typed: its tile, its recent purchase or the typed text itself.
export const sourceKeyOf = (entry: TypedEntry): string => entry.tile?.key ?? entry.recent?.id ?? TYPED_TILE_KEY;

// Flights go between tiles of the sheet, the list and recently bought; one item has one tile in each.
export const sheetKey = (tileKey: string) => `sheet:${tileKey}`;
export const listKey = (name: string) => `list:${nameKey(name)}`;
export const boughtKey = (name: string) => `bought:${nameKey(name)}`;
