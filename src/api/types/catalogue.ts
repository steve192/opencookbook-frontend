import {Aisle} from '../aisles';

/** A food of the catalogue, as search finds it. */
export interface CatalogueFood {
  id: number;
  displayName: string;
  sourceName: string | null;
  /** Per 100 g. */
  energyKcal: number | null;
  /** Grams per 100 g; null when the source has no value. */
  waterPer100g: number | null;
  /** Grams per 100 g: available carbohydrate less sugars; null when the source lacks either. */
  starchPer100g: number | null;
  /** Null for custom foods nobody placed. */
  aisle: Aisle | null;
}

export type SeasonCategory = 'FRUIT' | 'VEGETABLE' | 'SALAD';

/** From least to most climate impact. */
export type GrowingMethod = 'FIELD' | 'PROTECTED' | 'UNHEATED_GREENHOUSE' | 'HEATED_GREENHOUSE' | 'STORED';

export interface StorageFacts {
  /** Null when the sources disagree. */
  place: 'FRIDGE' | 'COOL_DARK' | null;
  coldSensitive: boolean;
  ethyleneProducer: boolean;
  ethyleneSensitive: boolean;
}

export interface SeasonalFood {
  id: number;
  displayName: string;
  /** An icon name, Fluent Emoji or one of assets/own-icons; null shows the produce aisle's icon. */
  icon: string | null;
  category: SeasonCategory;
  /** Month 1 to 12 -> how the food comes to market then; months without any are left out. */
  months: Record<string, GrowingMethod[]>;
  /** The months it counts as in season: grown outdoors, not in a greenhouse or from storage. */
  inSeason: number[];
  /** Null when the sources agree on nothing. */
  storage: StorageFacts | null;
}

/** A seed, flake or grain the bread tool puts into a soaker. */
export interface SoakingFood {
  foodId: number;
  /** Grams of water a gram soaks up. */
  absorption: number;
}
