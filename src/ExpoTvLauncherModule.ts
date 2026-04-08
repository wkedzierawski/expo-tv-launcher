import { requireNativeModule } from "expo";

import type { ExpoTvLauncherModuleType } from "./ExpoTvLauncher.types";

export default requireNativeModule<ExpoTvLauncherModuleType>("ExpoTvLauncher");
