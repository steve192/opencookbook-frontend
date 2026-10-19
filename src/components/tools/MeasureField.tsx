import React from 'react';
import {useUnitSystem} from '../../helper/useUnitSystem';
import {fromDisplayed, Measure, toDisplayed, unitLabel} from '../../tools/units';
import {NumberField} from './NumberField';

interface Props {
  label: string;
  measure: Measure;
  /** In metric units: °C, g, cm or ml. */
  value: number;
  onChange: (metric: number) => void;
  /** In metric units. */
  min: number;
  max: number;
  hint?: string;
  info?: string;
}

// A number in the units the user chose, kept in metric underneath.
export const MeasureField = (props: Props) => {
  const [system] = useUnitSystem();
  const shown = (metric: number) => Math.round(toDisplayed(props.measure, metric, system) * 10) / 10;
  return (
    <NumberField
      label={props.label}
      unit={unitLabel(props.measure, system)}
      value={shown(props.value)}
      min={Math.min(shown(props.min), shown(props.max))}
      max={Math.max(shown(props.min), shown(props.max))}
      hint={props.hint}
      info={props.info}
      onChange={(displayed) => props.onChange(fromDisplayed(props.measure, displayed, system))} />
  );
};
