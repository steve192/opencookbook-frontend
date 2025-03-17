export default ({config}) => {
  const currentdate = new Date();
  const now = currentdate.getDate() + '/' +
                (currentdate.getMonth()+1) + '/' +
                currentdate.getFullYear() + ' @ ' +
                currentdate.getHours() + ':' +
                currentdate.getMinutes() + ':' +
                currentdate.getSeconds();

  // Set the Android package name based on the build profile
  const buildProfile = process.env.EAS_BUILD_PROFILE;
  if (buildProfile === 'production') {
    // config.android.package = 'com.sterul.opencookbook';
  } else if (buildProfile === 'development') {
    config.name = 'Cookpal (devclient)';
    config.android.package = 'com.sterul.opencookbook.dev';
  } else if (buildProfile === 'preview') {
    config.name = 'Cookpal (preview)';
    config.android.package = 'com.sterul.opencookbook.preview';
  }
  return {
    ...config,
    extra: {
      buildTime: now,
      defaultApiUrl: process.env.DEFAULT_API_URL,
      eas: {
        projectId: '1d5a474b-fc28-458a-a1e4-c9b4468bbfff',
      },
    },
  };
};
