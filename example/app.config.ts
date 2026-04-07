import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'expo-tv-launcher-example',
  slug: 'expo-tv-launcher-example',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'expo.modules.tvlauncher.example',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'expo.modules.tvlauncher.example',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    ['@react-native-tvos/config-tv', { isTV: true }],
    ['../app.plugin.js', { packageName: 'expo.modules.tvlauncher.example' }],
  ],
};

export default config;
