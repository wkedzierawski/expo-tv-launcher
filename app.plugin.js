const { createRunOncePlugin, withAndroidManifest } = require('expo/config-plugins');

const pkg = require('./package.json');

const LAUNCHER_ACTIVITY = 'expo.modules.tvlauncher.LauncherActivity';
const TARGET_PACKAGE_META_DATA = 'expo.modules.tvlauncher.TARGET_PACKAGE';

function getConfiguredTargetPackage(config, props) {
  if (props && typeof props === 'object' && typeof props.packageName === 'string' && props.packageName.length > 0) {
    return props.packageName;
  }

  if (typeof config.android?.package === 'string' && config.android.package.length > 0) {
    return config.android.package;
  }

  throw new Error('expo-tv-launcher requires a packageName option or expo.android.package in app config.');
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function createHomeIntentFilter() {
  return {
    action: [
      {
        $: {
          'android:name': 'android.intent.action.MAIN',
        },
      },
    ],
    category: [
      {
        $: {
          'android:name': 'android.intent.category.HOME',
        },
      },
      {
        $: {
          'android:name': 'android.intent.category.DEFAULT',
        },
      },
    ],
  };
}

const withExpoTvLauncher = (config, props = {}) => {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults?.manifest?.application?.[0];

    if (!application) {
      return config;
    }

    const targetPackage = getConfiguredTargetPackage(config, props);

    const existingActivities = ensureArray(application.activity);
    const existingIndex = existingActivities.findIndex(
      (activity) => activity?.$?.['android:name'] === LAUNCHER_ACTIVITY
    );
    const existingMetaData = ensureArray(application['meta-data']);
    const metaDataIndex = existingMetaData.findIndex(
      (entry) => entry?.$?.['android:name'] === TARGET_PACKAGE_META_DATA
    );

    const launcherActivity = {
      $: {
        'android:name': LAUNCHER_ACTIVITY,
        'android:enabled': 'false',
        'android:excludeFromRecents': 'true',
        'android:exported': 'true',
        'android:launchMode': 'singleTask',
        'android:theme': '@android:style/Theme.NoDisplay',
      },
      'intent-filter': [createHomeIntentFilter()],
    };
    const targetPackageMetaData = {
      $: {
        'android:name': TARGET_PACKAGE_META_DATA,
        'android:value': targetPackage,
      },
    };

    if (existingIndex >= 0) {
      existingActivities[existingIndex] = launcherActivity;
    } else {
      existingActivities.push(launcherActivity);
    }

    if (metaDataIndex >= 0) {
      existingMetaData[metaDataIndex] = targetPackageMetaData;
    } else {
      existingMetaData.push(targetPackageMetaData);
    }

    application.activity = existingActivities;
    application['meta-data'] = existingMetaData;
    return config;
  });
};

module.exports = createRunOncePlugin(withExpoTvLauncher, pkg.name, pkg.version);
