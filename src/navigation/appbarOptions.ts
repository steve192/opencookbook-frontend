import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {ReactNode} from 'react';

/**
 * What a screen puts in the app bar.
 *
 * Deliberately not navigation's own `headerLeft` and `headerRight`. A custom `header` does not
 * replace the native one, it hides it, and native-stack still renders those into that hidden
 * header - so anything in them is mounted twice, and a menu or dialog opens a second portal
 * over the app anchored to a button nobody can see.
 */
export interface AppbarOptions {
  title?: string;
  /** Shown at the left, in place of the back action. */
  leading?: () => ReactNode;
  /** Shown at the right. */
  actions?: () => ReactNode;
}

interface OptionsSink {
  setOptions: (options: NativeStackNavigationOptions) => void;
}

// Rides along in the options bag; navigation passes keys it does not know through untouched.
export const setAppbarOptions = (
    navigation: OptionsSink | undefined, options: AppbarOptions,
): void => navigation?.setOptions(options as NativeStackNavigationOptions);

export const appbarOptionsOf = (options: NativeStackNavigationOptions): AppbarOptions => options;
