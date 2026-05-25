module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          alias: {
            'react-native-vector-icons': '@expo/vector-icons',
          },
        },
      ],
      // react-native-worklets/plugin must be listed last (Reanimated v4 requirement).
      'react-native-worklets/plugin',
    ],
  };
};
