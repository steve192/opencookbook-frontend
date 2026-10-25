import React from 'react';
import {useTranslation} from 'react-i18next';
import {useUnitSystem} from '../../helper/useUnitSystem';
import {formatMeasure, fromDisplayed, Measure, toDisplayed, UnitSystem} from '../../tools/units';
import {SliderField} from './SliderField';

interface Props {
  label: string;
  info?: string;
  hint?: string;
  measure: Measure;
  /** In metric units: °C, g, cm or ml. */
  value: number;
  min: number;
  max: number;
  /** One step of the slider in the units shown. */
  step: Record<UnitSystem, number>;
  onChange: (metric: number) => void;
}

// A measure chosen by dragging, in the units the user chose, kept in metric underneath.
export const MeasureSlider = (props: Props) => {
  const {i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const step = props.step[system];
  const shown = (metric: number) => Math.round(toDisplayed(props.measure, metric, system) / step) * step;
  return (
    <SliderField label={props.label} info={props.info} hint={props.hint} value={shown(props.value)} min={shown(props.min)}
      max={shown(props.max)} step={step}
      format={(displayed) => formatMeasure(props.measure, fromDisplayed(props.measure, displayed, system), system,
          i18n.language)}
      onChange={(displayed) => props.onChange(fromDisplayed(props.measure, displayed, system))} />
  );
};
