import {ShoppingChanges, ShoppingItem, ShoppingOp} from '../../dao/RestAPI';
import {nameKey} from './names';
import {joinSpecs} from './specs';

/** A list's items by id. */
export type ItemMap = Record<string, ShoppingItem>;

/** One list as this device knows it. */
export interface ListSync {
  /** The items as the server last said. */
  server: ItemMap;
  /** The server version those items are at; 0 before the first sync. */
  version: number;
  /** What this device changed and the server has not confirmed yet, oldest first. */
  pending: PendingOp[];
}

export interface PendingOp {
  op: ShoppingOp;
  /** When it was made on the device, as an ISO instant. */
  at: string;
}

/** A list as any app version stored it; older ones kept pending ops without their time. */
export type StoredListSync = Omit<ListSync, 'pending'> & {pending: (PendingOp | ShoppingOp)[]};

// Pending ops stored without a time count as made now.
export const timedPending = (stored: StoredListSync['pending'], now: string): PendingOp[] =>
  stored.map((entry) => ('op' in entry ? entry : {op: entry, at: now}));

/** What "recently bought" keeps, as the server does. */
export const RECENTLY_BOUGHT_KEPT = 60;

/**
 * What the device holds after the server answered.
 *
 * @param {ItemMap} items what it held
 * @param {ShoppingChanges} changes the answer
 * @return {ItemMap} the whole list when the answer is full, otherwise the changes laid over it
 */
export const withChanges = (items: ItemMap, changes: ShoppingChanges): ItemMap => {
  const next: ItemMap = changes.full ? {} : {...items};
  changes.items.forEach((item) => {
    if (item.deleted) {
      delete next[item.id];
    } else {
      next[item.id] = item;
    }
  });
  return next;
};

const withNameKey = (items: ItemMap, key: string): ShoppingItem | undefined =>
  Object.values(items).find((item) => nameKey(item.name) === key);

const added = (items: ItemMap, op: Extract<ShoppingOp, {type: 'ADD'}>, now: string,
    addedBy: string | null): ShoppingItem => {
  const existing = withNameKey(items, nameKey(op.name));
  const prioritized = !!op.prioritized;
  if (existing?.status === 'ACTIVE') {
    return {...existing, spec: joinSpecs(existing.spec, op.spec), sources: [...existing.sources, ...(op.sources ?? [])],
      prioritized: !!existing.prioritized || prioritized, addedAt: now};
  }
  if (existing) {
    return {...existing, status: 'ACTIVE', boughtAt: null, spec: joinSpecs(null, op.spec), sources: op.sources ?? [],
      prioritized, addedAt: now};
  }
  return {
    id: op.itemId, name: op.name.trim(), spec: joinSpecs(null, op.spec), aisle: op.aisle ?? 'OTHER', aisleManual: false,
    icon: op.icon ?? null, prioritized, status: 'ACTIVE', boughtAt: null, addedAt: now, addedBy,
    sources: op.sources ?? [], deleted: false, version: 0,
  };
};

const updated = (items: ItemMap, item: ShoppingItem, op: Extract<ShoppingOp, {type: 'UPDATE'}>): ShoppingItem => {
  const renamed = op.name?.trim() && (nameKey(op.name) === nameKey(item.name) || !withNameKey(items, nameKey(op.name)));
  return {
    ...item,
    name: renamed ? op.name!.trim() : item.name,
    spec: op.spec === undefined ? item.spec : joinSpecs(null, op.spec),
    aisle: op.aisle ?? item.aisle,
    aisleManual: item.aisleManual || op.aisle !== undefined,
    prioritized: op.prioritized ?? item.prioritized,
  };
};

/**
 * One op applied on the device, as the server will apply it, so the list looks right before it
 * has answered. What the server decides differently - where a typed name is sold - it corrects.
 *
 * @param {ItemMap} items the list
 * @param {ShoppingOp} op the change
 * @param {string} now when it happens, as an ISO instant
 * @param {string} addedBy who is adding, for new items
 * @return {ItemMap} the list afterwards
 */
export const withOp = (items: ItemMap, op: ShoppingOp, now: string, addedBy: string | null = null): ItemMap => {
  if (op.type === 'ADD') {
    const item = added(items, op, now, addedBy);
    return {...items, [item.id]: item};
  }
  const item = items[op.itemId];
  if (!item) {
    return items;
  }
  switch (op.type) {
    case 'UPDATE':
      return {...items, [item.id]: updated(items, item, op)};
    case 'BUY':
      return item.status === 'ACTIVE' ? {...items, [item.id]: {...item, status: 'BOUGHT', boughtAt: now, prioritized: false}} : items;
    case 'RESTORE':
      return item.status === 'BOUGHT' ?
        {...items, [item.id]: {...item, status: 'ACTIVE', boughtAt: null, addedAt: now, spec: joinSpecs(null, op.spec),
          sources: []}} :
        items;
    case 'DELETE': {
      const rest = {...items};
      delete rest[item.id];
      return rest;
    }
  }
};

// What the server said, with this device's unconfirmed changes laid over it.
export const visibleItems = (held: ListSync | undefined): ItemMap =>
  (held?.pending ?? []).reduce((items, pending) => withOp(items, pending.op, pending.at), held?.server ?? {});

// Compared as times: the server writes microseconds, the device milliseconds.
const timeOf = (instant: string | null | undefined): number => (instant ? Date.parse(instant) : 0);

// Prioritized first, then oldest first, so what was added last is at the end.
export const activeItems = (items: ItemMap): ShoppingItem[] =>
  Object.values(items).filter((item) => item.status === 'ACTIVE')
      .sort((first, second) => Number(!!second.prioritized) - Number(!!first.prioritized) ||
        timeOf(first.addedAt) - timeOf(second.addedAt));

/** What an add op carries at most, as the server accepts. */
export const MAX_SOURCES_PER_ADD = 20;

/**
 * An add op putting an item on another list as it is, the newest meals it is for included.
 *
 * @param {ShoppingItem} item the item to copy
 * @param {string} itemId the copy's id
 * @return {ShoppingOp} the add, without its op id
 */
export const copyOf = (item: ShoppingItem, itemId: string): Omit<Extract<ShoppingOp, {type: 'ADD'}>, 'opId'> => ({
  type: 'ADD', itemId, name: item.name, spec: item.spec, aisle: item.aisle, icon: item.icon,
  sources: item.sources.slice(-MAX_SOURCES_PER_ADD), prioritized: !!item.prioritized,
});

/**
 * The newest purchases first, for putting back with one tap.
 *
 * @param {ItemMap} items the list
 * @return {ShoppingItem[]} at most as many as the server keeps
 */
export const recentlyBought = (items: ItemMap): ShoppingItem[] =>
  Object.values(items).filter((item) => item.status === 'BOUGHT')
      .sort((first, second) => timeOf(second.boughtAt) - timeOf(first.boughtAt))
      .slice(0, RECENTLY_BOUGHT_KEPT);
