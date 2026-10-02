import AsyncStorage from '@react-native-async-storage/async-storage';
import {defaultBackendUrl} from './api/defaultBackendUrl';
import {readSecure, writeSecure} from './api/secureStorage';
import {isSameInstance} from './helper/instanceAddress';
import {RETIRED_HOSTED_INSTANCE_URL} from './hostedInstance';

export default class AppPersistence {
  /**
   * @return {Promise<string>} the stored server, with the retired hosted address replaced by the current one
   */
  static async getBackendURL(): Promise<string> {
    const stored = await readSecure('backendUrl');
    if (stored && isSameInstance(stored, RETIRED_HOSTED_INSTANCE_URL)) {
      // Not switchServer: the account is the same on the new address, so nobody is signed out.
      const current = defaultBackendUrl();
      await writeSecure('backendUrl', current);
      return current;
    }
    return stored ?? defaultBackendUrl();
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
