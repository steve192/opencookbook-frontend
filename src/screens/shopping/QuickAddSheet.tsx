import React, {useDeferredValue} from 'react';
import {StyleSheet} from 'react-native';
import {Surface} from 'react-native-paper';
import Animated, {SlideInDown, SlideOutDown} from 'react-native-reanimated';
import {QuickAddPanel} from './QuickAddPanel';

// Docked above the field while adding; taps keep the keyboard open for the next item.
export const QuickAddSheet = (props: React.ComponentProps<typeof QuickAddPanel>) => {
  // The tiles render in the background, after the sheet has opened and behind typing.
  const ready = useDeferredValue(true, false);
  const typed = useDeferredValue(props.typed);
  return (
    <Animated.View style={styles.sheet} entering={SlideInDown.duration(200)} exiting={SlideOutDown.duration(200)}>
      <Surface elevation={3} style={styles.surface}>
        {ready && <QuickAddPanel {...props} typed={typed} />}
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // A fixed height, so the list above does not move while results change; the newest items stay in view.
  sheet: {height: '55%'},
  surface: {flex: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16},
});
