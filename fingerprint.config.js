// semantic-release bumps `expo.version` in app.json on every release, which
// would otherwise force a native APK rebuild even for JS-only changes.
// Versions don't affect what the native build actually compiles, so skip them.
// (`ExpoConfigVersions` also covers Android versionCode / iOS buildNumber,
// which bump_versions.py bumps alongside native changes anyway.)
module.exports = {
  sourceSkips: ["ExpoConfigVersions"],
};
