/** Where a shop sells something, in the order a shop is usually walked. */
export const AISLES = ['FRUIT_VEG', 'BREAD_BAKERY', 'DAIRY_EGGS', 'MEAT_FISH', 'DELI', 'FROZEN', 'PASTA_RICE_GRAINS',
  'BAKING', 'CANNED_JARS', 'OILS_SPICES_SAUCES', 'SWEETS_SNACKS', 'BEVERAGES', 'HOUSEHOLD', 'DRUGSTORE', 'OTHER'] as const;
export type Aisle = typeof AISLES[number];
