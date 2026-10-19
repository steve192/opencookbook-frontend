import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import {toolInputsChanged} from '../../redux/features/toolsSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {decodeInputsParameter} from '../../tools/inputs';
import {ToolId} from '../../tools/registry';

/**
 * A tool's inputs: from a shared link first, else as last left on this device. Every change is
 * remembered and put into the address, so the address bar always holds a link to this calculation.
 *
 * @param {ToolId} tool the tool
 * @param {Function} parse reads stored or linked inputs, falling back to defaults
 * @return {Array} the inputs and a way to change some of them
 */
export const useToolInputs = <T extends object>(tool: ToolId, parse: (raw: unknown) => T):
    [T, (changes: Partial<T>) => void] => {
  const route = useRoute<RouteProp<BaseNavigatorProps, 'ToolScreen'>>();
  const navigation = useNavigation<NativeStackNavigationProp<BaseNavigatorProps, 'ToolScreen'>>();
  const remembered = useAppSelector((state) => state.tools.inputs[tool]);
  const dispatch = useAppDispatch();
  const [inputs, setInputs] = useState<T>(() => parse(decodeInputsParameter(route.params?.i) ?? remembered));

  const change = (changes: Partial<T>) => {
    const next = {...inputs, ...changes};
    setInputs(next);
    dispatch(toolInputsChanged({tool, inputs: next}));
    navigation.setParams({i: JSON.stringify(next)});
  };
  return [inputs, change];
};
