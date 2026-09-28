import {ShoppingTile} from '../../dao/RestAPI';
import {nameKey} from './names';

/**
 * A tile's name in the given language, or in any when it has none there.
 *
 * @param {ShoppingTile} tile the tile
 * @param {string} language the app's
 * @return {string} the name to show
 */
export const tileName = (tile: ShoppingTile, language: string): string =>
  (tile.names[language] ?? Object.values(tile.names)[0] ?? [tile.key])[0];

const namesInOrder = (tile: ShoppingTile, language: string): string[] => [
  ...(tile.names[language] ?? []),
  ...Object.entries(tile.names).filter(([other]) => other !== language).flatMap(([, names]) => names),
];

// Lower is better: the whole name, then its start, then a word's start, then anywhere.
const rank = (name: string, typed: string): number | undefined => {
  const key = nameKey(name);
  if (key === typed) return 0;
  if (key.startsWith(typed)) return 1;
  if (key.split(/[\s-]/).some((word) => word.startsWith(typed))) return 2;
  if (key.includes(typed)) return 3;
  return undefined;
};

/**
 * The tiles whose names fit what is being typed, best first.
 *
 * @param {ShoppingTile[]} tiles every tile
 * @param {string} typed what is in the search field
 * @param {string} language the app's, whose names count first
 * @param {number} limit how many to offer
 * @return {ShoppingTile[]} the fitting tiles
 */
export const searchTiles = (tiles: ShoppingTile[], typed: string, language: string, limit = 24): ShoppingTile[] => {
  const key = nameKey(typed);
  if (key.length === 0) {
    return [];
  }
  return tiles
      .map((tile) => ({tile, rank: Math.min(...namesInOrder(tile, language).map((name) => rank(name, key) ?? 9))}))
      .filter((match) => match.rank < 9)
      .sort((first, second) => first.rank - second.rank ||
        tileName(first.tile, language).localeCompare(tileName(second.tile, language)))
      .slice(0, limit)
      .map((match) => match.tile);
};

/**
 * The tile named exactly this, for placing a typed item before the server has.
 *
 * @param {ShoppingTile[]} tiles every tile
 * @param {string} name as typed
 * @return {ShoppingTile | undefined} the tile, if one has that name in any language
 */
export const tileNamed = (tiles: ShoppingTile[], name: string): ShoppingTile | undefined => {
  const key = nameKey(name);
  return tiles.find((tile) => Object.values(tile.names).some((names) => names.some((other) => nameKey(other) === key)));
};
