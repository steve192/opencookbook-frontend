import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React from 'react';
import {Appbar} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';
import {appbarOptionsOf} from './appbarOptions';

/**
 * The app bar every stack screen wears.
 *
 * Native stacks each bring a header of their own, so without one definition the app would have
 * as many slightly different app bars as it has navigators - which is what happened the moment a
 * screen was added outside the main stack.
 *
 * @param {NativeStackHeaderProps} nav what the navigator knows about the screen being shown
 * @return {JSX.Element} the app bar
 */
export const PaperStackHeader = (nav: NativeStackHeaderProps) => {
  const theme = useAppTheme();
  const {leading, actions} = appbarOptionsOf(nav.options);

  return (
    <Appbar.Header style={{backgroundColor: theme.colors.primary}}>
      {nav.back ? (
        <Appbar.BackAction
          color={theme.colors.onPrimary}
          onPress={() => nav.navigation.goBack()} />
      ) : null}
      {leading?.()}
      <Appbar.Content color={theme.colors.onPrimary} title={nav.options.title} />
      {actions?.()}
    </Appbar.Header>
  );
};
