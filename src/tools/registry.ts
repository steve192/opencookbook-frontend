/** Every kitchen tool, in the order the overview shows them. */

export type ToolCategory = 'baking' | 'converters' | 'planning' | 'drinks';

export type ToolId =
  'pizzaDough' | 'bread' | 'yeastConverter' | 'ovenConverter' | 'partyPlanner' | 'seasonalCalendar' | 'coffee' | 'tea';

export interface ToolDefinition {
  id: ToolId;
  category: ToolCategory;
  /** A MaterialCommunityIcons name. */
  icon: string;
  /** Path segment in the app: `/app/tools/<slug>`. */
  slug: string;
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = ['baking', 'converters', 'planning', 'drinks'];

export const TOOLS: readonly ToolDefinition[] = [
  {id: 'pizzaDough', category: 'baking', icon: 'pizza', slug: 'pizza-dough'},
  {id: 'bread', category: 'baking', icon: 'baguette', slug: 'bread'},
  {id: 'yeastConverter', category: 'baking', icon: 'swap-horizontal', slug: 'yeast-converter'},
  {id: 'ovenConverter', category: 'converters', icon: 'stove', slug: 'oven-converter'},
  {id: 'partyPlanner', category: 'planning', icon: 'party-popper', slug: 'party-planner'},
  {id: 'seasonalCalendar', category: 'planning', icon: 'sprout', slug: 'seasonal-calendar'},
  {id: 'coffee', category: 'drinks', icon: 'coffee', slug: 'coffee'},
  {id: 'tea', category: 'drinks', icon: 'tea', slug: 'tea'},
];

/**
 * The tools of one category, in overview order.
 *
 * @param {ToolCategory} category the category
 * @return {ToolDefinition[]} its tools
 */
export const toolsOf = (category: ToolCategory): ToolDefinition[] =>
  TOOLS.filter((tool) => tool.category === category);

/**
 * The definition of a tool.
 *
 * @param {ToolId} id the tool
 * @return {ToolDefinition} its definition
 */
export const toolDefinition = (id: ToolId): ToolDefinition => {
  const tool = TOOLS.find((candidate) => candidate.id === id);
  if (!tool) {
    throw new Error(`Unknown tool ${id}`);
  }
  return tool;
};
