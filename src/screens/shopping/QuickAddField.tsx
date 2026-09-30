import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, Searchbar, Surface} from 'react-native-paper';

export type FieldHandle = React.ComponentRef<typeof Searchbar>;

interface Props {
  inputRef: React.RefObject<FieldHandle | null>;
  typed: string;
  onType: (typed: string) => void;
  /** Focusing the field is what starts adding. */
  onFocus: () => void;
  onSubmit: () => void;
  adding: boolean;
  onDone: () => void;
}

// The field adding starts from, always at the bottom. Submitting keeps the keyboard for the next item.
export const QuickAddField = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <Surface elevation={2} style={styles.bar}>
      <Searchbar
        ref={props.inputRef}
        style={styles.search}
        icon="plus"
        placeholder={t('screens.shopping.addPlaceholder')}
        value={props.typed}
        onChangeText={props.onType}
        onFocus={props.onFocus}
        onSubmitEditing={props.onSubmit}
        submitBehavior="submit" />
      {props.adding && <Button onPress={props.onDone}>{t('common.done')}</Button>}
    </Surface>
  );
};

const styles = StyleSheet.create({
  bar: {flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8},
  search: {flex: 1},
});
