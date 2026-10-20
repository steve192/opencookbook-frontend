import {ImageSourcePropType} from 'react-native';
import {BreadMethod} from '../../tools/bread/bread';
import {CoffeeMethod} from '../../tools/coffee/coffee';
import {DoughLeavener} from '../../tools/dough/dough';
import {PartyEvent} from '../../tools/party/partyData';
import {PizzaStyle} from '../../tools/pizza/pizzaData';
import {TeaType} from '../../tools/tea/tea';

// Photos from Wikimedia Commons, public domain or CC0; each folder's README lists the originals.

export const PIZZA_STYLE_PHOTOS: Record<PizzaStyle, ImageSourcePropType> = {
  neapolitan: require('../../../assets/tools/pizza-styles/neapolitan.webp'),
  contemporary: require('../../../assets/tools/pizza-styles/contemporary.webp'),
  newYork: require('../../../assets/tools/pizza-styles/newYork.webp'),
  romanTonda: require('../../../assets/tools/pizza-styles/romanTonda.webp'),
  pinsa: require('../../../assets/tools/pizza-styles/pinsa.webp'),
  romanTeglia: require('../../../assets/tools/pizza-styles/romanTeglia.webp'),
  detroit: require('../../../assets/tools/pizza-styles/detroit.webp'),
  sicilian: require('../../../assets/tools/pizza-styles/sicilian.webp'),
  blechpizza: require('../../../assets/tools/pizza-styles/blechpizza.webp'),
  focaccia: require('../../../assets/tools/pizza-styles/focaccia.webp'),
};

export const LEAVENER_PHOTOS: Record<DoughLeavener, ImageSourcePropType> = {
  fresh: require('../../../assets/tools/leaveners/fresh.webp'),
  instant: require('../../../assets/tools/leaveners/instant.webp'),
  activeDry: require('../../../assets/tools/leaveners/activeDry.webp'),
  sourdough: require('../../../assets/tools/leaveners/sourdough.webp'),
};

export const BREAD_METHOD_PHOTOS: Record<BreadMethod, ImageSourcePropType> = {
  starter: require('../../../assets/tools/bread-methods/starter.webp'),
  sour: require('../../../assets/tools/bread-methods/sour.webp'),
  yeast: require('../../../assets/tools/bread-methods/yeast.webp'),
};

export const COFFEE_METHOD_PHOTOS: Record<CoffeeMethod, ImageSourcePropType> = {
  pourOver: require('../../../assets/tools/coffee-methods/pourOver.webp'),
  filterMachine: require('../../../assets/tools/coffee-methods/filterMachine.webp'),
  frenchPress: require('../../../assets/tools/coffee-methods/frenchPress.webp'),
  aeroPress: require('../../../assets/tools/coffee-methods/aeroPress.webp'),
  moka: require('../../../assets/tools/coffee-methods/moka.webp'),
  espresso: require('../../../assets/tools/coffee-methods/espresso.webp'),
  fullyAutomatic: require('../../../assets/tools/coffee-methods/fullyAutomatic.webp'),
  coldBrewConcentrate: require('../../../assets/tools/coffee-methods/coldBrewConcentrate.webp'),
  coldBrewReady: require('../../../assets/tools/coffee-methods/coldBrewReady.webp'),
  japaneseIced: require('../../../assets/tools/coffee-methods/japaneseIced.webp'),
};

export const TEA_TYPE_PHOTOS: Record<TeaType, ImageSourcePropType> = {
  black: require('../../../assets/tools/tea-types/black.webp'),
  green: require('../../../assets/tools/tea-types/green.webp'),
  white: require('../../../assets/tools/tea-types/white.webp'),
  oolong: require('../../../assets/tools/tea-types/oolong.webp'),
  herbal: require('../../../assets/tools/tea-types/herbal.webp'),
  rooibos: require('../../../assets/tools/tea-types/rooibos.webp'),
  matchaUsucha: require('../../../assets/tools/tea-types/matchaUsucha.webp'),
  matchaKoicha: require('../../../assets/tools/tea-types/matchaKoicha.webp'),
};

export const PARTY_EVENT_PHOTOS: Record<PartyEvent, ImageSourcePropType> = {
  buffet: require('../../../assets/tools/party-events/buffet.webp'),
  platedDinner: require('../../../assets/tools/party-events/platedDinner.webp'),
  fingerFood: require('../../../assets/tools/party-events/fingerFood.webp'),
  bbq: require('../../../assets/tools/party-events/bbq.webp'),
  raclette: require('../../../assets/tools/party-events/raclette.webp'),
  cheeseFondue: require('../../../assets/tools/party-events/cheeseFondue.webp'),
};
