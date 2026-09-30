import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  children: React.ReactNode;
}

const PADDING = 12;

// The screen's main actions, pinned below its scrolling content; each action gets an equal share of the width.
// Clear of the system navigation bar, which Android draws over the app.
export const ScreenFooter = (props: Props) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, {borderTopColor: theme.colors.outlineVariant, paddingBottom: PADDING + insets.bottom}]}>
      {/* toArray drops the conditional actions and keys what is left by its original slot,
          so an action appearing or going away does not shift the identity of its neighbours. */}
      {React.Children.toArray(props.children).map((action) => (
        <View key={(action as React.ReactElement).key} style={styles.action}>{action}</View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {flexDirection: 'row', gap: 12, padding: PADDING, borderTopWidth: StyleSheet.hairlineWidth},
  action: {flex: 1},
});
