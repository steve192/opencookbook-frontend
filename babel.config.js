module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: [
          [
            'babel-plugin-module-resolver', {
              alias: {
                'react-native-vector-icons': '@expo/vector-icons',
              },
            }],
        ],
      },
      development: {
        plugins: [
          [
            'babel-plugin-module-resolver', {
              alias: {
                'react-native-vector-icons': '@expo/vector-icons',
              },
            }],
        ],
      },
    },
  };
};
