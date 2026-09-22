import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';

interface Props {
  /** Called once typing pauses, not on every key. */
  onSearch: (searchString: string) => void;
}

/** What a list leaves free above its first row, so its rows scroll up underneath the search bar. */
export const RECIPE_SEARCHBAR_SPACE = 100;

const TYPING_PAUSE_MS = 500;

/**
 * The search field floating over the top of a recipe list. Render it after the list, so it is drawn
 * on top.
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
    <View style={[CentralStyles.contentContainer, styles.container]}>
      <Searchbar
        value={input}
        onChangeText={onChangeText}
        style={styles.searchbar}
        placeholder={t('screens.overview.searchPlaceholder')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    height: RECIPE_SEARCHBAR_SPACE,
  },
  searchbar: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
});
