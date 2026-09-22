import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Searchbar} from 'react-native-paper';

interface Props {
  /** Called once typing pauses, not on every key. */
  onSearch: (searchString: string) => void;
  style?: StyleProp<ViewStyle>;
}

const TYPING_PAUSE_MS = 500;

/**
 * The search field of a recipe list.
 *
 * @param {Props} props what to do with what was typed
 * @return {React.JSX.Element} the search field
 */
export const RecipeSearchbar = (props: Props) => {
  const {t} = useTranslation('translation');
  const [input, setInput] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChangeText = (value: string) => {
    setInput(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => props.onSearch(value), TYPING_PAUSE_MS);
  };

  return (
    <Searchbar
      value={input}
      onChangeText={onChangeText}
      style={[styles.searchbar, props.style]}
      placeholder={t('screens.overview.searchPlaceholder')} />
  );
};

const styles = StyleSheet.create({
  searchbar: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
});
