import { registerWebModule, NativeModule } from 'expo';

import { ExpoTvLauncherModuleEvents } from './ExpoTvLauncher.types';

class ExpoTvLauncherModule extends NativeModule<ExpoTvLauncherModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoTvLauncherModule, 'ExpoTvLauncherModule');
