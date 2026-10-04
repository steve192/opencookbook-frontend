import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {navigationRef} from '../navigation/navigationRef';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {takeWaitingShare} from './incomingShare';

// Opens a share that came in signed out, for the screen at the bottom of the signed in stack.
export const useOpenWaitingShare = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainNavigationProps>>();
  useEffect(() => {
    const waiting = takeWaitingShare();
    const importOpen = navigation.getState().routes.some((route) => route.name === 'ImportScreen');
    if (waiting && !importOpen) {
      // Through the parent: this stack is still being set up and would drop its own navigation.
      navigationRef.navigate('default', {screen: 'ImportScreen', params: waiting.params});
    }
  }, [navigation]);
};
