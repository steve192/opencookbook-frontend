const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

export default ({config}) => {
  const currentdate = new Date();
  const now = currentdate.getDate() + '/' +
                (currentdate.getMonth()+1) + '/' +
                currentdate.getFullYear() + ' @ ' +
                currentdate.getHours() + ':' +
                currentdate.getMinutes() + ':' +
                currentdate.getSeconds();
  return {
    ...config,
    extra: {
      buildTime: now,
      defaultApiUrl: process.env.DEFAULT_API_URL,
      eas: {
        projectId: '1d5a474b-fc28-458a-a1e4-c9b4468bbfff',
      },
    },
    name: IS_PREVIEW ? 'CookPal (Preview)' : 'CookPal',
    ios: {
      bundleIdentifier: IS_PREVIEW ? 'com.sterul.opencookbookpreview' : 'com.sterul.opencookbook',
    },
    android: {
      package: IS_PREVIEW ? 'com.sterul.opencookbookpreview' : 'com.sterul.opencookbook',
    },
  };
};
