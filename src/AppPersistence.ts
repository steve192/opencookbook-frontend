import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
import {Recipe, RecipeGroup, UserInfo} from './dao/RestAPI';

export default class AppPersistence {
  static async clearOfflineData() {
    await AsyncStorage.multiRemove(['offline_userinfo', 'offline_recipes', 'offline_recipegroups', 'offline_userinfo']);
  }
  static async getRecipeGroupsOffline(): Promise<RecipeGroup[]> {
    const recipeGroups = await AsyncStorage.getItem('offline_recipegroups');
    if (recipeGroups === null) return [];
    return JSON.parse(recipeGroups);
  }

  static async storeRecipeGroupsOffline(recipeGroups: RecipeGroup[]) {
    if (Platform.OS !== 'android') {
      return;
    }
    await AsyncStorage.setItem('offline_recipegroups', JSON.stringify(recipeGroups));
  }
  static async getUserInfoOffline(): Promise<UserInfo|undefined> {
    const storedUserinfo = await AsyncStorage.getItem('offline_userinfo');
    if (storedUserinfo === null) return undefined;
    return JSON.parse(storedUserinfo);
  }

  static async storeUserInfoOffline(userinfo:UserInfo) {
    if (Platform.OS !== 'android') {
      return;
    }
    await AsyncStorage.setItem('offline_userinfo', JSON.stringify(userinfo));
  }
  static async storeRecipesOffline(recipes: Recipe[]) {
    if (Platform.OS !== 'android') {
      return;
    }
    await AsyncStorage.setItem('offline_recipes', JSON.stringify(recipes));
  }

  static async getRecipesOffline(): Promise<Recipe[]> {
    const storedRecipes = await AsyncStorage.getItem('offline_recipes');
    if (storedRecipes === null) return [];
    return JSON.parse(storedRecipes);
  }

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
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (e) {
      console.error('Error getting auth token from secure store', e);
      return null;
    }
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
    try {
      return await SecureStore.getItemAsync('refreshToken');
    } catch (e) {
      console.error('Error getting refresh token from secure store', e);
      return null;
    }
  }


  static async getBackendURL(): Promise<string> {
    let backendUrl = undefined;
    if (Platform.OS !== 'web') {
      try {
        backendUrl = await SecureStore.getItemAsync('backendUrl');
      } catch (e) {
        console.error('Error getting backend url', e);
      }
    } else {
      backendUrl = await AsyncStorage.getItem('backendUrl');
    }
    if (!backendUrl) {
      // Default backend url if not set
      backendUrl = Constants.expoConfig?.extra?.defaultApiUrl ? Constants.expoConfig?.extra?.defaultApiUrl : 'https://beta.cookpal.io';
    }
    console.log('Backend url is' + backendUrl);
    return backendUrl;
  }

  static async setBackendURL(url: string) {
    if (Platform.OS === 'web') {
      try {
        await AsyncStorage.setItem('backendUrl', url);
      } catch (e) {
        console.error('Error saving backend url', e);
      }
      return;
    }
    await SecureStore.setItemAsync('backendUrl', url);
  }

  static getApiRoute(): string {
    return '/api/v1';
  }
}
