import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {BackHandler, Keyboard} from 'react-native';
import {FieldHandle} from './QuickAddField';

// Also ends on system back (whose first press only hides the keyboard) and when leaving the screen.
export const useQuickAdd = (navigation: Pick<NavigationProp<ParamListBase>, 'addListener'>) => {
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

  useEffect(() => {
    if (!adding) {
      return undefined;
    }
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      stop();
      return true;
    });
    const leaving = navigation.addListener('blur', stop);
    return () => {
      back.remove();
      leaving();
    };
  }, [adding, navigation, stop]);

  return {adding, typed, setTyped, fieldRef, start, next, stop};
};
