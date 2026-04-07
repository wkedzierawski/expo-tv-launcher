import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoTvLauncherViewProps } from './ExpoTvLauncher.types';

const NativeView: React.ComponentType<ExpoTvLauncherViewProps> =
  requireNativeView('ExpoTvLauncher');

export default function ExpoTvLauncherView(props: ExpoTvLauncherViewProps) {
  return <NativeView {...props} />;
}
