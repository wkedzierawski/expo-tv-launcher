import { useEffect, useState } from 'react';

import ExpoTvLauncher from './ExpoTvLauncherModule';
import type { LauncherStatus, TargetPackage } from './ExpoTvLauncher.types';

function readStatus(): LauncherStatus {
  return ExpoTvLauncher.getStatus();
}

export function useLauncher() {
  const [status, setStatus] = useState<LauncherStatus>(() => readStatus());

  const refresh = () => {
    const nextStatus = readStatus();
    setStatus(nextStatus);
    return nextStatus;
  };

  const setTargetPackage = (packageName: TargetPackage) => {
    ExpoTvLauncher.setTargetPackage(packageName);
    return refresh();
  };

  const enableLauncher = async () => {
    const enabled = await ExpoTvLauncher.enableLauncher();
    refresh();
    return enabled;
  };

  const disableLauncher = async () => {
    const disabled = await ExpoTvLauncher.disableLauncher();
    refresh();
    return disabled;
  };

  const launchTargetApp = () => {
    const launched = ExpoTvLauncher.launchTargetApp();
    refresh();
    return launched;
  };

  const openTargetApp = (packageName: string) => {
    const launched = ExpoTvLauncher.openTargetApp(packageName);
    refresh();
    return launched;
  };

  const openHomeSettings = () => {
    const opened = ExpoTvLauncher.openHomeSettings();
    refresh();
    return opened;
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    status,
    targetPackage: status.targetPackage,
    launcherEnabled: status.launcherEnabled,
    currentHomePackage: status.currentHomePackage,
    targetLaunchable: status.targetLaunchable,
    setTargetPackage,
    enableLauncher,
    disableLauncher,
    launchTargetApp,
    openTargetApp,
    openHomeSettings,
    refresh,
  };
}
