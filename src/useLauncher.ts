import { useCallback, useEffect, useState } from "react";

import type { LauncherStatus, TargetPackage } from "./ExpoTvLauncher.types";
import ExpoTvLauncher from "./ExpoTvLauncherModule";

function readStatus(): LauncherStatus {
  return ExpoTvLauncher.getStatus();
}

export function useLauncher() {
  const [status, setStatus] = useState<LauncherStatus>(() => readStatus());

  const refresh = useCallback(() => {
    const nextStatus = readStatus();
    setStatus(nextStatus);
    return nextStatus;
  }, []);

  const setTargetPackage = useCallback(
    (packageName: TargetPackage) => {
      ExpoTvLauncher.setTargetPackage(packageName);
      return refresh();
    },
    [refresh],
  );

  const enableLauncher = useCallback(async () => {
    const enabled = await ExpoTvLauncher.enableLauncher();
    refresh();
    return enabled;
  }, [refresh]);

  const disableLauncher = useCallback(async () => {
    const disabled = await ExpoTvLauncher.disableLauncher();
    refresh();
    return disabled;
  }, [refresh]);

  const launchTargetApp = useCallback(() => {
    const launched = ExpoTvLauncher.launchTargetApp();
    refresh();
    return launched;
  }, [refresh]);

  const openTargetApp = useCallback(
    (packageName: string) => {
      const launched = ExpoTvLauncher.openTargetApp(packageName);
      refresh();
      return launched;
    },
    [refresh],
  );

  const openHomeSettings = useCallback(() => {
    const opened = ExpoTvLauncher.openHomeSettings();
    refresh();
    return opened;
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
