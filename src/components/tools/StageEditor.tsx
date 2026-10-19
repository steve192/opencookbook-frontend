import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, IconButton, Surface, Text} from 'react-native-paper';
import {useAppTheme} from '../../styles/CentralStyles';
import {Stage} from '../../tools/fermentation/fermentation';
import {MeasureSlider} from './MeasureSlider';
import {SliderField} from './SliderField';

interface Props {
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}

const MAX_STAGES = 6;

// The schedule as stages of hours at a temperature: counter, proofing box or fridge.
export const StageEditor = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const replace = (index: number, changes: Partial<Stage>) =>
    props.onChange(props.stages.map((stage, at) => at === index ? {...stage, ...changes} : stage));
  return (
    <View style={styles.list}>
      {props.stages.map((stage, index) => (
        <Surface key={index} elevation={0} style={[styles.stage, {borderColor: theme.colors.outlineVariant}]}>
          <View style={styles.header}>
            <Text variant="titleSmall">{t('tools.dough.stageNumber', {number: index + 1})}</Text>
            <IconButton icon="delete-outline" size={20} style={styles.remove}
              accessibilityLabel={t('tools.dough.removeStage')} disabled={props.stages.length === 1}
              onPress={() => props.onChange(props.stages.filter((_, at) => at !== index))} />
          </View>
          <SliderField label={t('tools.dough.stageHours')} value={stage.hours} min={0.5} max={96} step={0.5}
            format={(hours) => `${hours} ${t('tools.units.hours')}`} onChange={(hours) => replace(index, {hours})} />
          <MeasureSlider label={t('tools.dough.stageTemperature')} measure="temperature" value={stage.temperatureC}
            min={1} max={35} step={{metric: 1, imperial: 1}} onChange={(temperatureC) => replace(index, {temperatureC})} />
        </Surface>
      ))}
      {props.stages.length < MAX_STAGES &&
        <Button icon="plus" mode="text" style={styles.add}
          onPress={() => props.onChange([...props.stages, props.stages[props.stages.length - 1]])}>
          {t('tools.dough.addStage')}
        </Button>}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {gap: 8},
  stage: {borderWidth: 1, borderRadius: 12, padding: 12, gap: 4},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  remove: {margin: 0},
  add: {alignSelf: 'flex-start'},
});
