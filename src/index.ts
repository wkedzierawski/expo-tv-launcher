// Reexport the native module. On web, it will be resolved to ExpoTvLauncherModule.web.ts
// and on native platforms to ExpoTvLauncherModule.ts
export { default } from './ExpoTvLauncherModule';
export { default as ExpoTvLauncherView } from './ExpoTvLauncherView';
export * from  './ExpoTvLauncher.types';
