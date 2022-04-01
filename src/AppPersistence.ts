import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';

export default class AppPersistence {
  static async setAuthToken(token: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('authToken', token);
      return;
    }
    await SecureStore.setItemAsync('authToken', token);
  }

  static async getAuthToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem('authToken');
    }
    return SecureStore.getItemAsync('authToken');
  }


  static async setRefreshToken(token: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('refreshToken', token);
      return;
    }
    await SecureStore.setItemAsync('refreshToken', token);
  }

  static async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem('refreshToken');
    }
    return SecureStore.getItemAsync('refreshToken');
  }


  static async getBackendURL(): Promise<string> {
    let backendUrl = undefined;
    if (Platform.OS !== 'web') {
      backendUrl = await SecureStore.getItemAsync('backendUrl');
    } else {
      backendUrl = await AsyncStorage.getItem('backendUrl');
    }
    if (!backendUrl) {
      // Default backend url if not set
      backendUrl = Constants.manifest?.extra?.defaultApiUrl ? Constants.manifest?.extra?.defaultApiUrl : '';
    }
    return backendUrl;
  }

  static async setBackendURL(url: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('backendUrl', url);
      return;
    }
    await SecureStore.setItemAsync('backendUrl', url);
  }

  static getApiRoute(): string {
    return '/api/v1';
  }
}
