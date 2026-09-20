import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet} from 'react-native';
import {ActivityIndicator, Button, Dialog, List, Portal, Searchbar, Text} from 'react-native-paper';
import RestAPI, {CatalogueFood} from '../dao/RestAPI';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {formatNutrient} from '../helper/nutrition';
import {overlayStyles, useAppTheme} from '../styles/CentralStyles';

const SEARCH_DELAY_MS = 300;

interface Props {
  ingredientId: number;
  ingredientName: string;
  onDismiss: () => void;
  onLinked: () => void;
}

// Links the ingredient, not the line: the choice applies to every recipe using it.
export const IngredientLinkDialog = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();

  const [query, setQuery] = useState(props.ingredientName);
  const [foods, setFoods] = useState<CatalogueFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  // Shown inside the dialog: a snackbar would be hidden behind it.
  const [failure, setFailure] = useState<string>();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setFoods([]);
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      setSearching(true);
      RestAPI.searchCatalogue(trimmed)
          .then((found) => {
            if (current) {
              setFoods(found);
              setFailure(undefined);
            }
          })
          .catch((e) => current && setFailure(t(errorMessageKey(e, 'nutrition.link.searchFailed'))))
          .finally(() => current && setSearching(false));
    }, SEARCH_DELAY_MS);
    // Ignore answers to outdated queries.
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const link = async (catalogueFoodId: number | null) => {
    setSaving(true);
    setFailure(undefined);
    try {
      await RestAPI.linkIngredient(props.ingredientId, catalogueFoodId);
      props.onLinked();
    } catch (e) {
      setFailure(t(errorMessageKey(e, 'nutrition.link.failed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={true} onDismiss={props.onDismiss} style={overlayStyles.dialogView} testID='ingredient-link-dialog'>
        <Dialog.Title>{t('nutrition.link.title', {ingredient: props.ingredientName})}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Searchbar
            testID='ingredient-link-search'
            placeholder={t('nutrition.link.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            loading={searching} />
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            {t('nutrition.link.appliesEverywhere')}
          </Text>
          {failure && <Text style={{color: theme.colors.error}}>{failure}</Text>}
        </Dialog.Content>
        <Dialog.ScrollArea style={styles.results}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {foods.length === 0 && !searching && query.trim() !== '' &&
              <Text style={[styles.noResults, {color: theme.colors.onSurfaceVariant}]}>{t('nutrition.link.noResults')}</Text>
            }
            {foods.map((food) => (
              <List.Item
                key={food.id}
                testID='ingredient-link-result'
                disabled={saving}
                title={food.displayName}
                titleNumberOfLines={2}
                description={[
                  food.sourceName !== food.displayName ? food.sourceName : null,
                  food.energyKcal === null ? null :
                    t('nutrition.link.per100g', {energy: formatNutrient(food.energyKcal, 'kcal', i18n.language)}),
                ].filter(Boolean).join(' · ')}
                descriptionNumberOfLines={2}
                onPress={() => link(food.id)} />
            ))}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={overlayStyles.dialogActions}>
          {saving && <ActivityIndicator animating={true} />}
          <Button testID='ingredient-link-exclude' disabled={saving} onPress={() => link(null)}>
            {t('nutrition.link.excludeButton')}
          </Button>
          <Button disabled={saving} onPress={props.onDismiss}>{t('common.cancel')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  results: {
    maxHeight: 360,
    paddingHorizontal: 0,
  },
  noResults: {
    padding: 16,
  },
});
