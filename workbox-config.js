module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,png,jpg,ico,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};