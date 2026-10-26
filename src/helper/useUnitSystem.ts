import {deviceMeasurementSystem} from '../i18n/locale';
import {unitSystemChosen} from '../redux/features/toolsSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {defaultUnitSystem, UnitSystem} from '../tools/units';

/**
 * The units every tool shows, one choice for all of them.
 *
 * @return {Array} the units and a way to change them
 */
export const useUnitSystem = (): [UnitSystem, (system: UnitSystem) => void] => {
  const chosen = useAppSelector((state) => state.tools.unitSystem);
  const dispatch = useAppDispatch();
  return [chosen ?? defaultUnitSystem(deviceMeasurementSystem), (system) => dispatch(unitSystemChosen(system))];
};
