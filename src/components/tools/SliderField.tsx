import Slider from '@react-native-community/slider';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useAppTheme} from '../../styles/CentralStyles';
import {InfoButton} from '../InfoButton';
import {HintText} from '../QuestionSection';

interface Props {
  /** Finished texts. */
  label: string;
  info?: string;
  /** Shown below the track. */
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** How the value reads next to the label. */
  format: (value: number) => string;
  /** Called once the slider is let go, so a drag does not recalculate on every step. */
  onChange: (value: number) => void;
}

// A value chosen by dragging, with the label and the current value above the track.
export const SliderField = (props: Props) => {
  const theme = useAppTheme();
  const [shown, setShown] = useState(props.value);
  useEffect(() => setShown(props.value), [props.value]);
  return (
    <View>
      <View style={styles.header}>
        <Text variant="bodyLarge" style={styles.label}>{props.label}</Text>
        {props.info && <InfoButton title={props.label} text={props.info} />}
        <Text variant="titleMedium" style={styles.value}>{props.format(shown)}</Text>
      </View>
      <Slider value={props.value} minimumValue={props.min} maximumValue={props.max} step={props.step}
        accessibilityLabel={props.label} minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.outlineVariant} thumbTintColor={theme.colors.primary}
        onValueChange={setShown} onSlidingComplete={props.onChange} />
      {props.hint && <HintText>{props.hint}</HintText>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 34},
  label: {flexShrink: 1},
  value: {marginLeft: 'auto'},
});
