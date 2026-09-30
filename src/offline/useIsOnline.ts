import {useAppSelector} from '../redux/hooks';
import {selectIsOnline} from './connectivitySlice';

export const useIsOnline = (): boolean => useAppSelector(selectIsOnline);
