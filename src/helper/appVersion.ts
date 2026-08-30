import * as Application from 'expo-application';
import Constants from 'expo-constants';

/** Which version(s) of the app are currently running. */
export interface AppVersion {
  /** The version to show. Empty when neither source knows one. */
  version: string;
  /**
   * The installed binary's version, set only when it differs from `version` -
   * i.e. when an OTA update is running on top of an older install.
   */
  build?: string;
}

/**
 * Resolves the running app version.
 *
 * `expo.version` travels with the JS bundle, so after an OTA update it reflects
 * the delivered update. `Application.nativeApplicationVersion` is the version
 * baked into the installed APK/AAB. Reporting both when they diverge makes an
 * otherwise invisible state - an update layered over an older binary - obvious
 * from a screenshot.
 *
 * On web there is no separate binary and expo-application returns null, so the
 * result collapses to the bundled version without needing a platform branch.
 *
 * Translation is left to the caller so this stays free of i18n coupling and
 * keeps the app's typed translation keys checked at the call site.
 *
 * @return {AppVersion} the version to display, plus the binary's own version
 *   when an update is running on top of it.
 */
export const resolveAppVersion = (): AppVersion => {
  const bundled = Constants.expoConfig?.version ?? '';
  const native = Application.nativeApplicationVersion ?? '';

  // Only one of the two known, or both agree -> a single version is shown.
  if (!bundled || !native || native === bundled) {
    return {version: bundled || native};
  }
  return {version: bundled, build: native};
};
