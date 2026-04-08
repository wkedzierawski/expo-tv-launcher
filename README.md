# expo-tv-launcher

`expo-tv-launcher` is an Expo module for Android TV / Google TV that implements a launcher owned by your app.

![expo-tv-launcher demo](./videos/expo-tv-launcher-example.gif)

It lets your app:

- persist a target app package name,
- enable or disable a HOME handler component,
- launch the saved target app on demand,
- redirect HOME presses to the saved target app when your component is selected as HOME,
- optionally use local ADB on `localhost:5555` to disable stock launchers and set your app as HOME, mirroring the behavior of the analyzed APK.

It does not make the target app a real system launcher.

## What It Is

This module provides:

- a Kotlin Expo Module for Android,
- a `LauncherActivity` that can act as a HOME handler,
- `SharedPreferences` storage for the selected target package,
- a config plugin that injects the HOME activity into the Android manifest during `expo prebuild`,
- a JS mock for iOS,
- a JS mock for web.

## What It Is Not

This module does not:

- ship with privileged permissions,
- require root,
- guarantee replacement of the OEM launcher,
- turn an arbitrary third-party app into the true system launcher.

It can use ADB shell commands when local ADB over TCP is available, but the mechanism still belongs to your app, not the redirected target app.

Behavior depends on Android TV / Google TV version, OEM policy, whether `adbd` is reachable on `localhost:5555`, and whether the device authorizes the generated ADB key.

Important: if you want the full APK-like behavior that disables stock launchers and reassigns HOME automatically, ADB / developer debugging must be enabled on the device.

## Installation

```bash
npm install expo-tv-launcher
```

## Config Plugin

Add the plugin in your `app.config.ts`:

```ts
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  plugins: [
    [
      "expo-tv-launcher",
      {
        packageName: "com.example.my-tv-app",
      },
    ],
  ],
};

export default config;
```

The plugin adds `expo.modules.tvlauncher.LauncherActivity` to the Android manifest with a HOME intent filter and stores the configured package name in manifest metadata.

If `packageName` is omitted, the plugin falls back to `expo.android.package`.

## Manual Android Setup

If you are not using Expo config plugins / CNG, add the module manually:

- register `expo.modules.tvlauncher.LauncherActivity` in your Android manifest
- give it `MAIN`, `HOME` and `DEFAULT` intent categories
- add manifest metadata `expo.modules.tvlauncher.TARGET_PACKAGE` with the only allowed target package
- make sure your app includes the module through Expo autolinking or manual native integration

## API

```ts
setTargetPackage(packageName: string | null): void
getTargetPackage(): string | null
isLauncherEnabled(): boolean
enableLauncher(): Promise<boolean>
disableLauncher(): Promise<boolean>
getCurrentHomePackage(): string | null
launchTargetApp(): boolean
openTargetApp(packageName: string): boolean
openHomeSettings(): boolean
getStatus(): {
  targetPackage: string | null
  launcherEnabled: boolean
  currentHomePackage: string | null
  targetLaunchable: boolean
}
```

## Usage

```ts
import ExpoTvLauncher from "expo-tv-launcher";

ExpoTvLauncher.setTargetPackage("com.example.my-tv-app");
const enabled = await ExpoTvLauncher.enableLauncher();

const status = ExpoTvLauncher.getStatus();
const launched = ExpoTvLauncher.launchTargetApp();
```

## Hook

```ts
import { useLauncher } from "expo-tv-launcher";

const {
  status,
  setTargetPackage,
  enableLauncher,
  disableLauncher,
  launchTargetApp,
  openHomeSettings,
  refresh,
} = useLauncher();
```

## Android Notes

- Target app launch uses `getLeanbackLaunchIntentForPackage` first.
- If that fails, it falls back to `getLaunchIntentForPackage`.
- If no target package is saved, the HOME redirector falls back to launching the host app, matching the behavior observed in the APK.
- If no target app is saved or launch is impossible, the HOME redirector finishes without crashing.
- The HOME component is toggled with `PackageManager.setComponentEnabledSetting(...)`.
- `enableLauncher()` enables the HOME component, tries to disable known stock launchers via ADB, and runs `cmd package set-home-activity <your.package>`.
- `disableLauncher()` re-enables known stock launchers via ADB and only then disables the HOME component.
- The package passed in the Expo config plugin is treated as the only allowed target package. `setTargetPackage()` and `openTargetApp()` cannot switch to a different package at runtime.
- Known stock launcher packages handled by the module:
- `com.google.android.tvlauncher`
- `com.google.android.apps.tv.launcherx`
- `com.google.android.tungsten.setupwraith`

## ADB Requirement

The ADB-assisted flow only works when the device exposes a local ADB daemon on `localhost:5555` and accepts the app-generated RSA key.

If `localhost:5555` is not reachable, `enableLauncher()` / `disableLauncher()` return `false`. The module still keeps the pure Android component toggle path internally, but the APK-like stock-launcher switching depends on ADB.

## Debugging Requirement

The full ADB-assisted launcher flow requires developer features to be enabled on the device.

- USB debugging / ADB debugging must be enabled
- the local ADB daemon must be reachable on `localhost:5555`
- the device must authorize the RSA key generated by the app

Without debugging-enabled ADB access:

- the app can still exist as a HOME handler declared in the manifest
- the user may still be able to select it manually as the HOME app in system settings
- but `enableLauncher()` / `disableLauncher()` will not be able to disable stock launchers or reassign HOME through ADB

## Uninstall And Recovery

The safe path is:

- call `disableLauncher()` first
- verify that the stock launcher is back
- only then uninstall your app

If the app is uninstalled while it is still acting as HOME, the result depends on the device and OEM build.

Inference from the current implementation:

- `enableLauncher()` disables known stock launchers with `pm disable-user --user 0 ...`
- it then assigns HOME to your app with `cmd package set-home-activity <your.package>`
- if you uninstall your app without calling `disableLauncher()` first, your HOME app may disappear while the stock launchers are still disabled
- on some devices Android will fall back to another available HOME app or show the launcher picker
- on other devices you may end up with no usable HOME screen until you recover through external ADB

If that happens, reconnect over external ADB from your computer and re-enable the stock launchers:

```bash
adb shell pm enable com.google.android.tvlauncher
adb shell pm enable com.google.android.apps.tv.launcherx
adb shell pm enable com.google.android.tungsten.setupwraith
```

Then set HOME back to a stock launcher that exists on the device:

```bash
adb shell cmd package set-home-activity com.google.android.tvlauncher
```

On some Google TV devices the correct package is instead:

```bash
adb shell cmd package set-home-activity com.google.android.apps.tv.launcherx
```

If you are not sure which launcher is present, check first:

```bash
adb shell pm list packages | grep -E 'tvlauncher|launcherx|setupwraith'
```

If the device is already in a bad state and you have no working external ADB access, recovery may require opening system settings another way or, in the worst case, a factory reset.

## Platform Support

- Android: real implementation
- iOS: JS mock, no native Swift implementation
- Web: JS mock only

## Example App

The `example` app is configured for the React Native TV fork, not stock React Native.

- `example/package.json` uses `react-native: npm:react-native-tvos@0.81-stable`
- `example/app.config.ts` enables `@react-native-tvos/config-tv` with `isTV: true`
- Android TV build is verified in this repo with Gradle
- Apple TV native generation is verified with `expo prebuild`; compiling on macOS additionally requires the matching tvOS platform to be installed in Xcode

## Limitations

- This launcher works as a HOME redirector. Your app becomes the HOME handler, not the target app.
- The user may still need to select your app as the HOME app in system UI.
- Some OEM builds may ignore or constrain HOME behavior.
- Without working local ADB or elevated privileges, full launcher replacement is not guaranteed.

## Disclaimer

This package is provided `as is`.

- You use it at your own risk.
- I am not responsible for any damage, misconfiguration, soft-brick, loss of launcher access, device instability, data loss, or other issues caused by using this package.
- This applies especially to ADB-assisted flows, HOME reassignment, stock launcher disabling, and uninstalling the host app while it is still configured as the active launcher.
