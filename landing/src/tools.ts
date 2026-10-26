// The kitchen tools with a landing page. The slugs must match the app's routes, /app/tools/<slug>.
export type ToolId =
  | 'pizzaDough'
  | 'bread'
  | 'yeastConverter'
  | 'ovenConverter'
  | 'partyPlanner'
  | 'seasonalCalendar'
  | 'coffee'
  | 'tea';

export type ToolCategory = 'baking' | 'converters' | 'planning' | 'drinks';

export interface ToolDefinition {
  id: ToolId;
  category: ToolCategory;
  /** Path segment in the app and of the English page. */
  slug: string;
  /** Path segment of the German page. */
  slugDe: string;
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = ['baking', 'converters', 'planning', 'drinks'];

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'pizzaDough', category: 'baking', slug: 'pizza-dough', slugDe: 'pizzateig-rechner' },
  { id: 'bread', category: 'baking', slug: 'bread', slugDe: 'brot-rechner' },
  { id: 'yeastConverter', category: 'baking', slug: 'yeast-converter', slugDe: 'hefe-umrechner' },
  { id: 'ovenConverter', category: 'converters', slug: 'oven-converter', slugDe: 'backofen-umrechner' },
  { id: 'partyPlanner', category: 'planning', slug: 'party-planner', slugDe: 'party-mengenrechner' },
  { id: 'seasonalCalendar', category: 'planning', slug: 'seasonal-calendar', slugDe: 'saisonkalender' },
  { id: 'coffee', category: 'drinks', slug: 'coffee', slugDe: 'kaffee-rechner' },
  { id: 'tea', category: 'drinks', slug: 'tea', slugDe: 'tee-rechner' },
];

export const toolsOf = (category: ToolCategory) => TOOLS.filter((tool) => tool.category === category);
