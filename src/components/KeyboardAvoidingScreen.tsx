import React from 'react';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import CentralStyles from '../styles/CentralStyles';

// A whole screen that shrinks above the keyboard.
export const KeyboardAvoidingScreen = ({children}: {children: React.ReactNode}) => (
  <KeyboardAvoidingView behavior="padding" style={CentralStyles.fullscreen}>{children}</KeyboardAvoidingView>
);
