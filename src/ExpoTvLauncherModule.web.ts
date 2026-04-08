import type {
  ExpoTvLauncherModuleType,
  LauncherStatus,
  TargetPackage,
} from "./ExpoTvLauncher.types";

class ExpoTvLauncherWebMock implements ExpoTvLauncherModuleType {
  private targetPackage: TargetPackage = null;

  setTargetPackage(packageName: TargetPackage): void {
    this.targetPackage =
      typeof packageName === "string" && packageName.length > 0
        ? packageName
        : null;
  }

  getTargetPackage(): TargetPackage {
    return this.targetPackage;
  }

  isLauncherEnabled(): boolean {
    return false;
  }

  async enableLauncher(): Promise<boolean> {
    return false;
  }

  async disableLauncher(): Promise<boolean> {
    return false;
  }

  getCurrentHomePackage(): string | null {
    return null;
  }

  launchTargetApp(): boolean {
    return false;
  }

  openTargetApp(_packageName: string): boolean {
    return false;
  }

  openHomeSettings(): boolean {
    return false;
  }

  getStatus(): LauncherStatus {
    return {
      targetPackage: this.targetPackage,
      launcherEnabled: false,
      currentHomePackage: null,
      targetLaunchable: false,
    };
  }
}

export default new ExpoTvLauncherWebMock();
