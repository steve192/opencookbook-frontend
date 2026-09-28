import {ShoppingList} from '../../dao/RestAPI';

/**
 * The list a plan's shopping goes to unless another is chosen: that plan's default list.
 *
 * @param {ShoppingList[]} lists every list
 * @param {string} householdId the plan's household, or nothing for your own
 * @return {ShoppingList | undefined} the default list of that scope
 */
export const defaultListFor = (lists: ShoppingList[], householdId?: string | null): ShoppingList | undefined =>
  lists.find((list) => list.defaultList && list.householdId === (householdId ?? null));

/**
 * What a list is called: its own name, or for an unrenamed default list the household's or "mine".
 *
 * @param {ShoppingList} list the list
 * @param {string} myList what your own default list is called in the app's language
 * @return {string} the name to show
 */
export const listName = (list: ShoppingList, myList: string): string => list.name ?? list.householdName ?? myList;

/**
 * Whose a list is, as the plan choice shows it.
 *
 * @param {ShoppingList} list the list
 * @return {string} a group for a household's list, a person for your own
 */
export const listIcon = (list: ShoppingList): string => list.householdId ? 'account-group' : 'account';
