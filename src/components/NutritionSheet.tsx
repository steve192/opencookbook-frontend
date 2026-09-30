import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Divider, Icon, IconButton, Modal, Portal, Text, TouchableRipple} from 'react-native-paper';
import {NutritionLine, NutritionSummary, RecipeNutrition} from '../api/types/nutrition';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {canWeighPieces, formatEstimate, formatNutrient, lineNoteKeys, linesWarningFirst, NUTRIENT_ROWS, nutritionColumns} from '../helper/nutrition';
import {useIsOnline} from '../offline/useIsOnline';
import {overlayStyles, useAppTheme} from '../styles/CentralStyles';
import {IngredientLinkDialog} from './IngredientLinkDialog';
import {OwnPortionDialog} from './OwnPortionDialog';

export interface NutritionSheetProps {
  summary: NutritionSummary;
  scaledServings: number;
  onDismiss: () => void;
  /** Only a recipe of your own can be corrected. */
  canCorrect: boolean;
}

interface Props extends NutritionSheetProps {
  /** The lines, undefined while they are not there. */
  details?: RecipeNutrition;
  error?: unknown;
  onRetry: () => void;
}

export const NutritionSheet = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();

  const [correcting, setCorrecting] = useState<NutritionLine>();
  const [weighing, setWeighing] = useState<NutritionLine>();

  const {details} = props;
  const failure = !details && props.error ? t(errorMessageKey(props.error, 'nutrition.loadFailed')) : undefined;
  const canCorrect = props.canCorrect && online;
  // Newer than props.summary after a correction.
  const summary = details?.summary ?? props.summary;

  // A correction refreshes the lines and the recipe's summary by itself.
  const corrected = () => {
    setCorrecting(undefined);
    setWeighing(undefined);
  };

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={props.onDismiss}
        contentContainerStyle={[overlayStyles.sheetView, {backgroundColor: theme.colors.elevation.level3}]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>{t('nutrition.sheetTitle')}</Text>
          <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={props.onDismiss} />
        </View>
        <ScrollView contentContainerStyle={styles.body} testID='nutrition-sheet'>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('nutrition.estimateNotice')}</Text>
          <SummaryNotice summary={summary} canCorrect={props.canCorrect} />
          {summary.status !== 'UNAVAILABLE' && <ValueTable summary={summary} scaledServings={props.scaledServings} />}

          <Divider />
          <Text variant="titleMedium">{t('nutrition.ingredients')}</Text>
          {canCorrect && <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('nutrition.tapToCorrect')}</Text>}
          {failure &&
            <View style={styles.failure}>
              <Text style={{color: theme.colors.error}}>{failure}</Text>
              <Button icon="refresh" onPress={props.onRetry}>{t('nutrition.retry')}</Button>
            </View>
          }
          {!details && !failure && <ActivityIndicator animating={true} />}
          {details && linesWarningFirst(details.lines).map((line, index) => (
            <LineRow
              key={index}
              line={line}
              onPress={canCorrect && line.ingredientId !== null ? () => setCorrecting(line) : undefined}
              onWeigh={canCorrect && canWeighPieces(line) ? () => setWeighing(line) : undefined} />
          ))}

          <View style={styles.sources}>
            <Divider />
            <Text variant="labelMedium">{t('nutrition.limitsTitle')}</Text>
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('nutrition.limitsNotice')}</Text>
          </View>

          {details && details.attributions.length > 0 &&
            <View style={styles.sources}>
              <Divider />
              <Text variant="labelMedium">{t('nutrition.sources')}</Text>
              {details.attributions.map((attribution) => (
                <Text key={attribution.source} variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
                  {attribution.text}{' '}
                  <Text
                    variant="bodySmall"
                    style={{color: theme.colors.primary, textDecorationLine: 'underline'}}
                    onPress={() => Linking.openURL(attribution.licenseUrl)}>
                    {attribution.license}
                  </Text>
                </Text>
              ))}
            </View>
          }
        </ScrollView>
      </Modal>
      {correcting?.ingredientId != null &&
        <IngredientLinkDialog
          ingredientId={correcting.ingredientId}
          ingredientName={correcting.ingredientName}
          onDismiss={() => setCorrecting(undefined)}
          onLinked={corrected} />
      }
      {weighing?.ingredientId != null &&
        <OwnPortionDialog
          line={{...weighing, ingredientId: weighing.ingredientId}}
          onDismiss={() => setWeighing(undefined)}
          onSaved={corrected} />
      }
    </Portal>
  );
};

const SummaryNotice = (props: {summary: NutritionSummary, canCorrect: boolean}) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  if (props.summary.status === 'COMPLETE') {
    return null;
  }
  const unavailableKey = props.canCorrect ? 'nutrition.unavailableNotice' : 'nutrition.unavailableSharedNotice';
  const message = props.summary.status === 'UNAVAILABLE' ?
    t(unavailableKey) :
    t('nutrition.incompleteNotice', {count: props.summary.warningCount});
  return (
    <View style={styles.notice}>
      <Icon source="alert-outline" size={20} color={theme.colors.error} />
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
};

const ValueTable = (props: {summary: NutritionSummary, scaledServings: number}) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const columns = nutritionColumns(props.summary, props.scaledServings);

  return (
    <View testID='nutrition-values'>
      <View style={styles.tableRow}>
        <View style={styles.nutrientLabel} />
        {columns.perServing && <Text variant="labelMedium" style={styles.value}>{t('nutrition.perServing')}</Text>}
        <Text variant="labelMedium" style={styles.value}>
          {columns.totalServings === undefined ? t('nutrition.total') : t('nutrition.servingsTotal', {count: columns.totalServings})}
        </Text>
      </View>
      {NUTRIENT_ROWS.map((row) => (
        <View key={row.key} style={styles.tableRow}>
          <Text
            style={[styles.nutrientLabel, row.partOfAbove && {paddingLeft: 12, color: theme.colors.onSurfaceVariant}]}>
            {t(row.labelKey)}
          </Text>
          {columns.perServing &&
            <Text style={styles.value}>{formatEstimate(columns.perServing[row.key], row.unit, i18n.language)}</Text>
          }
          <Text style={styles.value}>{formatEstimate(columns.total[row.key], row.unit, i18n.language)}</Text>
        </View>
      ))}
    </View>
  );
};

const LineRow = (props: {line: NutritionLine, onPress?: () => void, onWeigh?: () => void}) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const {line} = props;

  const amount = [line.amount ?? '', line.unit ?? ''].join(' ').trim();
  const notes = [...lineNoteKeys(line).map((key) => t(key)), ...(line.ownPortion ? [t('nutrition.ownPortionNote')] : [])];
  const food = line.food ? t('nutrition.linkedTo', {food: line.food.displayName}) : undefined;
  const grams = line.grams === null ? undefined : formatNutrient(line.grams, 'g', i18n.language);

  return (
    <TouchableRipple onPress={props.onPress} disabled={!props.onPress} testID='nutrition-line'>
      <View style={styles.line}>
        {line.warns ?
          <Icon source="alert-outline" size={20} color={theme.colors.error} /> :
          <Icon source="circle-small" size={20} color={theme.colors.onSurfaceVariant} />
        }
        <View style={styles.lineText}>
          <Text>{[amount, line.ingredientName].filter(Boolean).join(' ')}</Text>
          {(food || grams) &&
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
              {[food, grams].filter(Boolean).join(' · ')}
            </Text>
          }
          {notes.length > 0 &&
            <Text variant="bodySmall" style={{color: line.warns ? theme.colors.error : theme.colors.onSurfaceVariant}}>
              {notes.join(' · ')}
            </Text>
          }
          {props.onWeigh &&
            <Button compact mode="text" icon="scale" style={styles.weighButton} onPress={props.onWeigh} testID='nutrition-line-weigh'>
              {t('nutrition.portion.button')}
            </Button>
          }
        </View>
        {line.status === 'RESOLVED' &&
          <Text style={styles.lineEnergy}>{formatNutrient(line.values.energyKcal, 'kcal', i18n.language)}</Text>
        }
        {props.onPress && <Icon source="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />}
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 8,
  },
  title: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  notice: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  nutrientLabel: {
    flex: 1.4,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  failure: {
    alignItems: 'flex-start',
    gap: 4,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  lineText: {
    flex: 1,
    gap: 2,
  },
  weighButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  lineEnergy: {
    minWidth: 64,
    textAlign: 'right',
  },
  sources: {
    gap: 6,
    paddingTop: 4,
  },
});
