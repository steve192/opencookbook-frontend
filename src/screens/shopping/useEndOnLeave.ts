import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import {BackHandler} from 'react-native';

export type LeavableNavigation = Pick<NavigationProp<ParamListBase>, 'addListener'>;

// Ends a mode of the screen on system back and when leaving the screen.
export const useEndOnLeave = (active: boolean, navigation: LeavableNavigation, end: () => void) => {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      end();
      return true;
    });
    const leaving = navigation.addListener('blur', end);
    return () => {
      back.remove();
      leaving();
    };
  }, [active, navigation, end]);
};
