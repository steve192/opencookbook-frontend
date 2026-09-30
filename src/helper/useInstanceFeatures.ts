import {useGetInstanceInfoQuery} from '../api/endpoints/account';
import {instanceFeatures, InstanceFeatures} from './instanceFeatures';

export const useInstanceFeatures = (): InstanceFeatures => instanceFeatures(useGetInstanceInfoQuery().data);
