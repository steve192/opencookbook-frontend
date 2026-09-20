import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';
import {SectionTitle} from './SectionTitle';

// Secondary text explaining the element above it.
export const HintText = (props: {children: React.ReactNode}) => {
  const theme = useAppTheme();
  return <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{props.children}</Text>;
};

interface Props {
  /** Finished texts, because translation keys are typed and only the caller holds the literals. */
  title: string;
  hint?: string;
  children: React.ReactNode;
}

// One question of a wizard: its title, what it is for, and the way to answer it.
export const QuestionSection = (props: Props) => (
  <View style={styles.section}>
    <SectionTitle>{props.title}</SectionTitle>
    {props.hint && <HintText>{props.hint}</HintText>}
    {props.children}
  </View>
);

const styles = StyleSheet.create({
  section: {gap: 8},
});
