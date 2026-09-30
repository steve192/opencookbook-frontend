import {useCallback, useState} from 'react';
import {LeavableNavigation, useEndOnLeave} from './useEndOnLeave';

const NONE: ReadonlySet<string> = new Set();

// Tiles picked by id, as for moving them to another list.
export const useItemSelection = (navigation: LeavableNavigation) => {
  const [selected, setSelected] = useState<ReadonlySet<string> | null>(null);

  const start = useCallback(() => setSelected(NONE), []);
  const stop = useCallback(() => setSelected(null), []);
  const toggle = useCallback((id: string) => setSelected((current) => {
    if (!current) {
      return current;
    }
    const next = new Set(current);
    if (current.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  }), []);

  useEndOnLeave(selected !== null, navigation, stop);

  return {selecting: selected !== null, selected: selected ?? NONE, start, stop, toggle};
};
