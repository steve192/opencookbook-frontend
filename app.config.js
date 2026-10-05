// EAS profiles and workflows may override the default instance.
const defaultApiUrl = process.env.DEFAULT_API_URL || 'https://cookpal.io';
const defaultInstance = new URL(defaultApiUrl);

export default ({config}) => {
  // Set the Android package name based on the build profile
  const buildProfile = process.env.EAS_BUILD_PROFILE;
  if (buildProfile === 'production') {
    // config.android.package = 'com.sterul.opencookbook';
  } else if (buildProfile === 'development') {
    config.name = 'CookPal (devclient)';
    config.android.package = 'com.sterul.opencookbook.dev';
  } else if (buildProfile === 'preview') {
    config.name = 'CookPal (preview)';
    config.android.package = 'com.sterul.opencookbook.preview';
  }
  return {
    ...config,
    android: {
      ...config.android,
      intentFilters: [
        ...config.android.intentFilters,
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{scheme: defaultInstance.protocol.slice(0, -1), host: defaultInstance.hostname, pathPrefix: `${config.experiments.baseUrl}/`}],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          // Google signs the app in through <package>:/oauthredirect.
          action: 'VIEW',
          data: [{scheme: config.android.package}],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      defaultApiUrl,
      eas: {
        projectId: '1d5a474b-fc28-458a-a1e4-c9b4468bbfff',
      },
    },
  };
};
