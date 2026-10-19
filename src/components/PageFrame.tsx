import React from 'react';
import {StyleSheet} from 'react-native';
import {Surface} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';
import {ScrollViewWithPosition} from './ScrollPosition';

interface Props {
  children: React.ReactNode;
  /** Children, counted as React.Children.toArray counts them, that stay on top while the page scrolls. */
  stickyHeaderIndices?: number[];
}

// The frame of a page of cards and forms: scrolling, and as wide as the rest of the app's content.
export const PageFrame = ({children, stickyHeaderIndices}: Props) => (
  <Surface style={CentralStyles.screen}>
    <ScrollViewWithPosition contentContainerStyle={[CentralStyles.contentContainer, styles.page]}
      stickyHeaderIndices={stickyHeaderIndices}>{children}</ScrollViewWithPosition>
  </Surface>
);

const styles = StyleSheet.create({
  page: {gap: 20},
});
