import {Aisle} from '../../api/aisles';
import {ShoppingTile} from '../../api/types/shopping';
import {nameKey} from './names';
import {parseQuickAdd} from './quickAdd';

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

/** A name with its comparison key, worked out once rather than on every keystroke. */
interface KeyedName {
  name: string;
  key: string;
}

/** A tile as typing searches it: its own name and every name it is found by, the app's language first. */
export interface IndexedTile {
  tile: ShoppingTile;
  shown: string;
  names: KeyedName[];
}

/**
 * The tiles prepared for searching in one language.
 *
 * @param {ShoppingTile[]} tiles the catalogue's
 * @param {string} language the app's
 * @return {IndexedTile[]} one per tile
 */
export const indexTiles = (tiles: ShoppingTile[], language: string): IndexedTile[] => tiles.map((tile) => ({
  tile,
  shown: tileName(tile, language),
  names: namesInOrder(tile, language).map((name) => ({name, key: nameKey(name)})),
}));

const NO_MATCH = 9;
/** Matched this well, a tile shows the matching name ("Milchreis"); matched inside a word, its own. */
const SHOWN_UP_TO = 1;

// Lower is better: the whole name, its start, a word's start, then a word's end, where German puts the noun of a
// compound ("Vanilleeis"); anywhere else inside a word is chance ("Fleisch" for "eis").
const rank = (key: string, typed: string): number => {
  if (key === typed) return 0;
  if (key.startsWith(typed)) return 1;
  const words = key.split(/[\s-]/);
  if (words.some((word) => word.startsWith(typed))) return 2;
  if (words.some((word) => word.endsWith(typed))) return 3;
  return NO_MATCH;
};

/** A name the list held before, as it was held. */
export interface KnownName {
  name: string;
  aisle: Aisle;
  icon: string | null;
}

/** Something to add from: a catalogue tile, an earlier entry, or the typed text. */
export interface Offer extends KnownName {
  /** Unique among the offers, for flights from the tile. */
  key: string;
  /** Placed by its tile or earlier entry; otherwise the server places it. */
  placed: boolean;
}

/** What may be added while typing; Enter adds the typed offer. */
export interface Offers {
  /** The amount typed with the name, given to whichever offer is taken. */
  spec: string | null;
  typed: Offer;
  earlier: Offer[];
  fitting: Offer[];
}

export const TYPED_TILE_KEY = 'typed';

const MAX_EARLIER = 8;
const MAX_FITTING = 24;

export const tileOffer = (tile: ShoppingTile, name: string): Offer =>
  ({key: tile.key, name, aisle: tile.aisle, icon: tile.icon, placed: true});

const earlierOffer = (known: KnownName): Offer => ({...known, key: `earlier:${nameKey(known.name)}`, placed: true});

const bestMatch = (names: KeyedName[], typed: string) => names.reduce<{name: string, rank: number}>(
    (best, each) => {
      const eachRank = rank(each.key, typed);
      return eachRank < best.rank ? {name: each.name, rank: eachRank} : best;
    }, {name: '', rank: NO_MATCH});

/**
 * The offers for what is typed. The first offer always carries the typed name: its tile, its earlier entry, or the
 * text itself. A tile found by the start of a name shows that name ("Milchreis" on the rice tile).
 *
 * @param {string} typed what is in the field
 * @param {Set} unitWords what makes "2 kg" an amount
 * @param {IndexedTile[]} tiles the catalogue's, indexed for the app's language
 * @param {KnownName[]} earlier what the list held before, most recent first
 * @return {Offers | undefined} nothing for an empty field
 */
export const offersFor = (typed: string, unitWords: ReadonlySet<string>, tiles: IndexedTile[],
    earlier: KnownName[]): Offers | undefined => {
  const {name, spec} = parseQuickAdd(typed, unitWords);
  const key = nameKey(name);
  if (key.length === 0) {
    return undefined;
  }
  const matches = tiles
      .map((indexed) => {
        const best = bestMatch(indexed.names, key);
        return {tile: indexed.tile, rank: best.rank, name: best.rank <= SHOWN_UP_TO ? best.name : indexed.shown};
      })
      .filter((match) => match.rank < NO_MATCH)
      .sort((one, other) => one.rank - other.rank || one.name.localeCompare(other.name));
  const exactTile = matches.find((match) => match.rank === 0);
  const exactEarlier = earlier.find((known) => nameKey(known.name) === key);
  let typedOffer: Offer = {key: TYPED_TILE_KEY, name, aisle: 'OTHER', icon: null, placed: false};
  if (exactTile) {
    typedOffer = tileOffer(exactTile.tile, exactTile.name);
  } else if (exactEarlier) {
    typedOffer = earlierOffer(exactEarlier);
  }
  const earlierOffers = earlier
      .map((known) => ({known, rank: rank(nameKey(known.name), key)}))
      .filter((match) => match.rank > 0 && match.rank < NO_MATCH)
      .sort((one, other) => one.rank - other.rank)
      .slice(0, MAX_EARLIER)
      .map((match) => earlierOffer(match.known));
  // A tile under a name already offered would show that name twice.
  const offered = new Set([typedOffer, ...earlierOffers].map((offer) => nameKey(offer.name)));
  return {
    spec,
    typed: typedOffer,
    earlier: earlierOffers,
    fitting: matches.filter((match) => !offered.has(nameKey(match.name))).slice(0, MAX_FITTING)
        .map((match) => tileOffer(match.tile, match.name)),
  };
};
