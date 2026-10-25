import React, {useEffect, useRef, useState} from 'react';
import {Image, ImageSourcePropType, StyleSheet, View} from 'react-native';
import {Avatar, Icon, Text, TouchableRipple} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '../styles/CentralStyles';
import {QuestionSection} from './QuestionSection';
import {useScrollPosition} from './ScrollPosition';

export interface Option<T> {
  value: T;
  /** Finished texts. */
  title: string;
  description?: string;
  /** A picture on the left. */
  image?: ImageSourcePropType;
  /** An icon on the left, where a picture would say nothing. */
  icon?: string;
  /** A short mark beside the title, such as "Recommended". */
  badge?: string;
}

interface RowProps<T> {
  option: Option<T>;
  highlighted: boolean;
  trailing?: string;
  onPress: () => void;
  accessibilityRole: 'radio' | 'button';
  accessibilityHint?: string;
}

const OptionRow = <T, >(props: RowProps<T>) => {
  const theme = useAppTheme();
  const {option} = props;
  return (
    <TouchableRipple borderless onPress={props.onPress} accessibilityRole={props.accessibilityRole}
      accessibilityState={props.accessibilityRole === 'radio' ? {selected: props.highlighted} : undefined}
      accessibilityHint={props.accessibilityHint}
      style={[styles.row, {borderColor: props.highlighted ? theme.colors.primary : theme.colors.outlineVariant,
        backgroundColor: props.highlighted ? theme.colors.secondaryContainer : theme.colors.surface}]}>
      <View style={styles.rowContent}>
        {option.image && <Image source={option.image} style={styles.image} accessible={false} />}
        {!option.image && option.icon &&
          <Avatar.Icon icon={option.icon} size={44} color={theme.colors.onSurfaceVariant}
            style={{backgroundColor: theme.colors.surfaceVariant}} />}
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text variant="titleSmall" style={styles.title}>{option.title}</Text>
            {option.badge &&
              <Text variant="labelSmall" style={[styles.badge, {backgroundColor: theme.colors.primaryContainer,
                color: theme.colors.onPrimaryContainer}]}>{option.badge}</Text>}
          </View>
          {option.description &&
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{option.description}</Text>}
        </View>
        {props.trailing && <Icon source={props.trailing} size={22} color={theme.colors.onSurfaceVariant} />}
      </View>
    </TouchableRipple>
  );
};

interface Props<T extends string> {
  /** Finished texts. */
  title: string;
  hint?: string;
  info?: string;
  options: Option<T>[];
  chosen: T;
  onChoose: (value: T) => void;
  /** What else belongs to the question, below the options. */
  children?: React.ReactNode;
}

// A choice among options that each need a picture or a sentence. It folds to the chosen one until it is changed.
export const OptionList = <T extends string>(props: Props<T>) => {
  const {t} = useTranslation('translation');
  const [open, setOpen] = useState(false);
  const scroll = useScrollPosition();
  const openedAt = useRef<number | undefined>(undefined);
  const chosen = props.options.find((option) => option.value === props.chosen) ?? props.options[0];

  // A long list leaves the reader far down the page once it folds; back to where they opened it.
  useEffect(() => {
    if (!open && openedAt.current != null) {
      scroll?.restore(openedAt.current);
      openedAt.current = undefined;
    }
  }, [open]);
  return (
    <QuestionSection title={props.title} hint={props.hint} info={props.info}>
      {open ?
        <View style={styles.list} accessibilityRole="radiogroup">
          {props.options.map((option) => (
            <OptionRow key={option.value} option={option} highlighted={option.value === chosen.value}
              trailing={option.value === chosen.value ? 'check' : undefined} accessibilityRole="radio"
              onPress={() => {
                setOpen(false);
                props.onChoose(option.value);
              }} />
          ))}
        </View> :
        <OptionRow option={chosen} highlighted={false} trailing="chevron-down" accessibilityRole="button"
          accessibilityHint={t('common.change')} onPress={() => {
            openedAt.current = scroll?.current();
            setOpen(true);
          }} />}
      {props.children}
    </QuestionSection>
  );
};

const styles = StyleSheet.create({
  list: {gap: 8},
  row: {borderRadius: 12, borderWidth: 1, overflow: 'hidden'},
  rowContent: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10},
  image: {width: 104, height: 104, borderRadius: 10},
  text: {flex: 1, gap: 2},
  titleRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6},
  title: {flexShrink: 1},
  badge: {borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden'},
});
