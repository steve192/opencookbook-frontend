module.exports = {
	globDirectory: 'dist/',
	// Everything the app needs to start and draw offline, fonts and shopping icons included.
	globPatterns: [
		'**/*.{css,js,png,jpg,webp,svg,ico,ttf,woff,woff2,html,json,webmanifest}'
	],
	// Expo exports the icon fonts under assets/node_modules, which workbox skips by default.
	globIgnores: [],
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

	// A new version waits until the app offers it and the reader takes it (workbox-window), so
	// nothing reloads in the middle of an edit.
	skipWaiting: false,
	clientsClaim: true,
	cleanupOutdatedCaches: true,

	// No runtime caching: recipe images are kept by the app itself (imageCache.web.ts), so they are there without a worker too.

	// Any address of the app opens offline too; the server's own paths never get the app instead.
	navigateFallback: '/index.html',
	navigateFallbackDenylist: [/^\/(api|admin|swagger-ui|v3\/api-docs|h2-console)/],
};
