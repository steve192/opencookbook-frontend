import React, {createContext, useContext} from 'react';
import {Platform, ScrollView, StyleSheet, ViewStyle} from 'react-native';
import {Surface} from 'react-native-paper';

const InFloatingPanel = createContext(false);

// Whether a component is drawn inside a floating panel, which already gives it a surface.
export const useInFloatingPanel = () => useContext(InFloatingPanel);

interface Props {
  children: React.ReactNode;
  /** Taller content scrolls inside the panel. */
  maxHeight: number;
}

// The web keeps the panel in view while the page scrolls; elsewhere it stays where it is.
const STICKY = Platform.OS === 'web' ? {position: 'sticky', top: 24} as unknown as ViewStyle : undefined;

// A panel floating above the page: rounded, with a shadow, beside what it belongs to.
export const FloatingPanel = (props: Props) => (
  <Surface elevation={3} style={[styles.panel, STICKY, {maxHeight: props.maxHeight}]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <InFloatingPanel.Provider value={true}>{props.children}</InFloatingPanel.Provider>
    </ScrollView>
  </Surface>
);

const styles = StyleSheet.create({
  panel: {borderRadius: 20, overflow: 'hidden'},
  content: {padding: 8, gap: 12},
});
