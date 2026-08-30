// Controls the native fingerprint used by the release workflow to decide
// whether an APK/AAB actually needs rebuilding. Everything skipped here is a
// value we bump ourselves on release, or one that carries no native state -
// hashing them would force a native build on every single release.
//
//  - ExpoConfigVersions ............ `version` and `android.versionCode`, both
//                                    bumped by bump_versions.py.
//  - ExpoConfigRuntimeVersionIfString `runtimeVersion`, bumped alongside
//                                    versionCode. Without this the gate would
//                                    re-trigger on the release right after any
//                                    native build, forever.
//  - ExpoConfigExtraSection ........ app.config.js derives `extra.defaultApiUrl`
//                                    from an environment variable, so `extra`
//                                    varies by environment. It is read at
//                                    runtime from the update manifest and holds
//                                    no native state.
module.exports = {
  sourceSkips: [
    "ExpoConfigVersions",
    "ExpoConfigRuntimeVersionIfString",
    "ExpoConfigExtraSection",
  ],
};
