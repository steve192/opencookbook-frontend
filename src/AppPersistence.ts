import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {Platform} from 'react-native';
import {readSecure, writeSecure} from './api/secureStorage';

export default class AppPersistence {
  static async getBackendURL(): Promise<string> {
    return (await readSecure('backendUrl')) ?? AppPersistence.defaultBackendURL();
  }

  /**
   * Where to talk to when nobody has said otherwise.
   *
   * On the web this is the origin the app was served from, because a deployed web app and its api
   * live behind the same address. It matters most for somebody who has never signed in - opening
   * a share link, say - who has no stored server and cannot be asked for one.
   *
   * @return {string} the backend url to use
   */
  private static defaultBackendURL(): string {
    const configuredAtBuildTime = Constants.expoConfig?.extra?.defaultApiUrl;
    if (configuredAtBuildTime) {
      return configuredAtBuildTime;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'https://beta.cookpal.io';
  }

  static async setBackendURL(url: string) {
    await writeSecure('backendUrl', url);
  }

  /**
   * Whether photographs of scanned recipes may be kept to improve recognition.
   *
   * Undefined rather than false when nothing is stored: "no" is a decision to respect and
   * "not asked yet" is a question still to put, and they lead to different things.
   *
   * @return {Promise<boolean | undefined>} what was chosen, or undefined if it was never asked
   */
  static async getScanTrainingConsent(): Promise<boolean | undefined> {
    const stored = await AsyncStorage.getItem('scan_training_consent');
    return stored === null ? undefined : stored === 'true';
  }

  static async setScanTrainingConsent(consented: boolean) {
    await AsyncStorage.setItem('scan_training_consent', consented ? 'true' : 'false');
  }

  /**
   * Whether to ask for what planning needs to know after a recipe is imported. Asked every time
   * until the cook says not to; they can turn it back on in the settings.
   *
   * @return {Promise<boolean>} whether to ask
   */
  static async getAskForPlanningDetails(): Promise<boolean> {
    return await AsyncStorage.getItem('ask_planning_details') !== 'false';
  }

  static async setAskForPlanningDetails(ask: boolean) {
    await AsyncStorage.setItem('ask_planning_details', ask ? 'true' : 'false');
  }

  /**
   * @return {Promise<string | undefined>} the household whose cookbook was shown last; undefined for your own
   */
  static async getShownCookbook(): Promise<string | undefined> {
    return await AsyncStorage.getItem('shown_cookbook') ?? undefined;
  }

  static async setShownCookbook(householdId: string | undefined) {
    if (householdId) {
      await AsyncStorage.setItem('shown_cookbook', householdId);
    } else {
      await AsyncStorage.removeItem('shown_cookbook');
    }
  }
}
