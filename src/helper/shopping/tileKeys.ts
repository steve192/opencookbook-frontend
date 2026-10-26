import {nameKey} from './names';

// Flights go between tiles of the sheet, the list, the suggestions and recently bought; one item has one tile in each.
export const sheetKey = (tileKey: string) => `sheet:${tileKey}`;
export const listKey = (name: string) => `list:${nameKey(name)}`;
export const suggestedKey = (name: string) => `suggested:${nameKey(name)}`;
export const boughtKey = (name: string) => `bought:${nameKey(name)}`;
