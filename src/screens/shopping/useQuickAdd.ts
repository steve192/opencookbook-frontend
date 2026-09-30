import {useCallback, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {FieldHandle} from './QuickAddField';
import {LeavableNavigation, useEndOnLeave} from './useEndOnLeave';

// Also ends on system back (whose first press only hides the keyboard) and when leaving the screen.
export const useQuickAdd = (navigation: LeavableNavigation) => {
  const [adding, setAdding] = useState(false);
  const [typed, setTyped] = useState('');
  const fieldRef = useRef<FieldHandle>(null);

  const start = useCallback(() => setAdding(true), []);

  // Focused again, since a browser moves the focus to the tapped tile.
  const next = useCallback(() => {
    setTyped('');
    fieldRef.current?.focus();
  }, []);

  const stop = useCallback(() => {
    setAdding(false);
    setTyped('');
    fieldRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  useEndOnLeave(adding, navigation, stop);

  return {adding, typed, setTyped, fieldRef, start, next, stop};
};
