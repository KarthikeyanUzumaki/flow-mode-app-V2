module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // worklets-core MUST be registered before reanimated
      'react-native-worklets-core/plugin',
      'react-native-reanimated/plugin',
    ],
  };
};
