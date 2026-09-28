import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Aisle} from '../../dao/aisles';
import {groupByAisle} from '../../helper/shopping/aisles';

interface Props<T> {
  items: T[];
  renderItems: (items: T[]) => React.ReactNode;
}

// Items under a heading per aisle, in the order a shop is walked.
export const AisleSections = <T extends {aisle: Aisle}>({items, renderItems}: Props<T>) => {
  const {t} = useTranslation('translation');
  return (
    <>
      {groupByAisle(items).map((group) => (
        <View key={group.aisle} style={styles.section}>
          <Text variant="labelLarge" style={styles.heading}>{t(`aisles.${group.aisle}`)}</Text>
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
