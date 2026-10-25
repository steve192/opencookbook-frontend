import React from 'react';
import {Platform, StyleSheet, useWindowDimensions, View, ViewStyle} from 'react-native';
import {Surface} from 'react-native-paper';
import CentralStyles from '../../styles/CentralStyles';
import {FloatingPanel} from '../FloatingPanel';
import {PageFrame} from '../PageFrame';
import {ScrollViewWithPosition} from '../ScrollPosition';

interface Props {
  children: React.ReactNode;
  /** The result: floating beside the questions where the screen is wide enough, below them elsewhere. */
  result: React.ReactNode;
  /** The child, counted as React.Children.toArray counts them, that stays on top while the page scrolls. */
  stickyIndex?: number;
}

const WIDE_PX = 960;
// The app header and the space above and below the panel.
const PANEL_MARGIN_PX = 140;

// Beside the floating result the page scrolls as a whole, so only the web can keep a child on top there.
const STICKY = Platform.OS === 'web' ? {position: 'sticky', top: 0, zIndex: 1} as unknown as ViewStyle : undefined;

// A tool's page: on wide screens the result floats beside the questions, as a configurator shows the price.
export const ToolFrame = (props: Props) => {
  const {width, height} = useWindowDimensions();
  const children = React.Children.toArray(props.children);
  if (width < WIDE_PX) {
    return (
      <PageFrame stickyHeaderIndices={props.stickyIndex != null ? [props.stickyIndex] : undefined}>
        {children}{props.result}
      </PageFrame>
    );
  }
  return (
    <Surface style={CentralStyles.screen}>
      <ScrollViewWithPosition>
        <View style={styles.columns}>
          <View style={styles.questions}>
            {children.map((child, index) => index === props.stickyIndex ?
              <View key="sticky" style={STICKY}>{child}</View> : child)}
          </View>
          <View style={styles.side}>
            <FloatingPanel maxHeight={height - PANEL_MARGIN_PX}>{props.result}</FloatingPanel>
          </View>
        </View>
      </ScrollViewWithPosition>
    </Surface>
  );
};

const styles = StyleSheet.create({
  columns: {flexDirection: 'row', width: '100%', maxWidth: 1240, alignSelf: 'center', gap: 32,
    paddingHorizontal: 16, paddingVertical: 24},
  questions: {flex: 1, gap: 20},
  side: {width: 440},
});
