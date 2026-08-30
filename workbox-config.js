module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,png,jpg,ico,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],

	// The app bundle is well past workbox's 2 MiB default, so it was silently dropped from
	// the precache while index.html stayed in it. That pairing is what breaks a deploy: the
	// precached index.html keeps asking for a bundle hash that the new deploy has deleted,
	// nginx answers the miss with index.html, and the browser dies on "Unexpected token '<'".
	maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,

	// A new worker would otherwise stay in "waiting" until every tab of the site is closed,
	// which is why a stale index.html survives reloads.
	skipWaiting: true,
	clientsClaim: true,
	cleanupOutdatedCaches: true
};
