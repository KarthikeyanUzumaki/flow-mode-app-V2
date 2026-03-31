module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // `react-native-worklets-core` is required for VisionCamera frame processors.
    // `react-native-reanimated` must NOT override those frame-processor worklets,
    // so we scope it only to files that actually use Reanimated hooks.
    plugins: ['react-native-worklets-core/plugin'],
    overrides: [
      {
        test: [
          './App.tsx',
          './src/components/StatusBar.tsx',
          './src/components/DetectionOverlay.tsx',
        ],
        plugins: ['react-native-reanimated/plugin'],
      },
    ],
  };
};