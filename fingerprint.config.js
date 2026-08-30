// semantic-release bumps `expo.version` in app.json on every release, which
// would otherwise force a native APK rebuild even for JS-only changes.
// Versions don't affect what the native build actually compiles, so skip them.
// (`ExpoConfigVersions` also covers Android versionCode / iOS buildNumber,
// which bump_versions.py bumps alongside native changes anyway.)
//
// `ExpoConfigExtraSection` is needed because app.config.js derives
// `extra.defaultApiUrl` from the DEFAULT_API_URL environment variable. eas-cli
// fingerprints the project twice - once on the machine invoking the build and
// once inside the build environment - and any difference between those two
// evaluations aborts the build with a runtime version mismatch. `extra` holds
// no native state (it is read at runtime from the update manifest), so keeping
// it out of the hash is both safe and what makes the two evaluations agree.
module.exports = {
  sourceSkips: ["ExpoConfigVersions", "ExpoConfigExtraSection"],
};
