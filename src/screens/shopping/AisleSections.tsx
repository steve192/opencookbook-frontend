import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Aisle} from '../../api/aisles';
import {groupByAisle} from '../../helper/shopping/aisles';
import {AisleHeading} from './AisleHeading';

interface Props<T> {
  items: T[];
  renderItems: (items: T[]) => React.ReactNode;
}

// Items under a heading per aisle, in the order a shop is walked.
export const AisleSections = <T extends {aisle: Aisle}>({items, renderItems}: Props<T>) => {
  return (
    <>
      {groupByAisle(items).map((group) => (
        <View key={group.aisle} style={styles.section}>
          <AisleHeading aisle={group.aisle} style={styles.heading} />
          {renderItems(group.items)}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  section: {marginBottom: 12},
  heading: {marginBottom: 6},
});
