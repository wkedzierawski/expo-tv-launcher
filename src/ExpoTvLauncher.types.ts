export type TargetPackage = string | null;

export type LauncherStatus = {
  targetPackage: TargetPackage;
  launcherEnabled: boolean;
  currentHomePackage: string | null;
  targetLaunchable: boolean;
};

export type ExpoTvLauncherModuleType = {
  setTargetPackage(packageName: TargetPackage): void;
  getTargetPackage(): TargetPackage;
  isLauncherEnabled(): boolean;
  enableLauncher(): Promise<boolean>;
  disableLauncher(): Promise<boolean>;
  getCurrentHomePackage(): string | null;
  launchTargetApp(): boolean;
  openTargetApp(packageName: string): boolean;
  openHomeSettings(): boolean;
  getStatus(): LauncherStatus;
};
