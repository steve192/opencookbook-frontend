import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';

export default class Configuration {
  private static backendURL = 'https://opencookbook.sterul.com';


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


  static getBackendURL(): string {
    return this.backendURL;
  }

  static setBackendURL(url: string) {
    this.backendURL = url;
  }

  static getApiRoute(): string {
    return '/api/v1';
  }
}
