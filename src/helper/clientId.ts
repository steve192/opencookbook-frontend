import {randomUUID} from 'expo-crypto';

// For ids the device chooses, so it can refer to what it made while offline.
export const newClientId = (): string => randomUUID();
